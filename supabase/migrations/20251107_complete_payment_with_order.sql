CREATE OR REPLACE FUNCTION public.complete_payment_with_order(
    p_payment_id uuid,
    p_user_id uuid DEFAULT NULL,
    p_order_payload jsonb DEFAULT '{}'::jsonb,
    p_metadata_patch jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_payment public.payments%ROWTYPE;
    v_metadata jsonb := '{}'::jsonb;
    v_existing_order_id text;
    v_order public.orders;
    v_should_create_order boolean := false;
BEGIN
    SELECT *
    INTO v_payment
    FROM public.payments
    WHERE id = p_payment_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'PAYMENT_NOT_FOUND' USING ERRCODE = 'P0002';
    END IF;

    v_metadata := COALESCE(v_payment.metadata, '{}'::jsonb);
    v_existing_order_id := v_metadata->>'order_id';

    IF v_existing_order_id IS NOT NULL THEN
        IF v_payment.status <> 'completed' THEN
            UPDATE public.payments
            SET status = 'completed',
                completed_at = NOW(),
                updated_at = NOW()
            WHERE id = p_payment_id;
        END IF;

        RETURN jsonb_build_object(
            'payment_id',
            v_payment.id,
            'order_id',
            v_existing_order_id::uuid,
            'status',
            'completed',
            'already_processed',
            true
        );
    END IF;

    v_should_create_order :=
        p_user_id IS NOT NULL
        AND (p_order_payload ? 'order_items')
        AND jsonb_array_length(COALESCE(p_order_payload->'order_items', '[]'::jsonb)) > 0;

    IF v_should_create_order THEN
        SELECT *
        INTO v_order
        FROM public.create_new_order(
            p_user_id,
            COALESCE((p_order_payload->>'total_amount')::numeric, v_payment.amount),
            COALESCE(p_order_payload->>'currency', v_payment.currency),
            p_order_payload->'shipping_address',
            p_order_payload->'billing_address',
            COALESCE(p_order_payload->>'payment_method', v_payment.method),
            COALESCE(p_order_payload->'order_items', '[]'::jsonb)
        );

        IF v_order.id IS NULL THEN
            RAISE EXCEPTION 'ORDER_CREATION_FAILED' USING ERRCODE = 'P0001';
        END IF;
    END IF;

    v_metadata := v_metadata || COALESCE(p_metadata_patch, '{}'::jsonb);

    IF v_order.id IS NOT NULL THEN
        v_metadata := v_metadata || jsonb_build_object('order_id', v_order.id);
    END IF;

    UPDATE public.payments
    SET status = 'completed',
        completed_at = NOW(),
        updated_at = NOW(),
        metadata = v_metadata
    WHERE id = p_payment_id;

    RETURN jsonb_build_object(
        'payment_id',
        v_payment.id,
        'order_id',
        v_order.id,
        'status',
        'completed',
        'already_processed',
        false
    );
END;
$$;
