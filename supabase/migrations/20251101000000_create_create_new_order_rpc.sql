CREATE OR REPLACE FUNCTION public.create_new_order(
    p_user_id uuid,
    p_total_amount numeric,
    p_currency text,
    p_shipping_address jsonb,
    p_billing_address jsonb,
    p_payment_method text,
    p_order_items jsonb
)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order_id uuid;
    v_order_row public.orders;
    item jsonb;
BEGIN
    -- Insert into orders table
    INSERT INTO public.orders (
        user_id,
        total_amount,
        currency,
        shipping_address,
        billing_address,
        payment_method,
        status
    )
    VALUES (
        p_user_id,
        p_total_amount,
        p_currency,
        p_shipping_address,
        p_billing_address,
        p_payment_method,
        'pending' -- Initial status
    )
    RETURNING id INTO v_order_id;

    -- Insert into order_items table
    FOR item IN SELECT * FROM jsonb_array_elements(p_order_items)
    LOOP
        INSERT INTO public.order_items (
            order_id,
            product_id,
            quantity,
            unit_price,
            total_price
        )
        VALUES (
            v_order_id,
            item->>'product_id',
            (item->>'quantity')::integer,
            (item->>'unit_price')::numeric,
            (item->>'total_price')::numeric
        );
    END LOOP;

    -- Return the newly created order row
    SELECT * INTO v_order_row FROM public.orders WHERE id = v_order_id;
    RETURN v_order_row;
END;
$$;
