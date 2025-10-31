ALTER TABLE public.order_tracking DROP CONSTRAINT idx_order_tracking_order_number;

ALTER TABLE public.payment_attempts ADD CONSTRAINT fk_payment_attempts_payment_id FOREIGN KEY (payment_id) REFERENCES public.payments(hp_payment_id);
