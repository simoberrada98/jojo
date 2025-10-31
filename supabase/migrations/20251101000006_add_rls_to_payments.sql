-- Add RLS policies to payments, webhook_events, and payment_attempts tables

-- Enable RLS on the tables
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_attempts ENABLE ROW LEVEL SECURITY;

-- RLS policies for payments table
CREATE POLICY "Users can view their own payments" ON public.payments
  FOR SELECT
  USING (auth.uid() = (metadata->>'user_id')::uuid);

CREATE POLICY "Admins can view all payments" ON public.payments
  FOR SELECT
  USING (get_my_claim('user_role')::text = '"admin"');

-- RLS policies for webhook_events table
CREATE POLICY "Admins can view all webhook events" ON public.webhook_events
  FOR SELECT
  USING (get_my_claim('user_role')::text = '"admin"');

-- RLS policies for payment_attempts table
CREATE POLICY "Users can view their own payment attempts" ON public.payment_attempts
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM payments WHERE payments.hp_payment_id = payment_attempts.payment_id AND (payments.metadata->>'user_id')::uuid = auth.uid()));

CREATE POLICY "Admins can view all payment attempts" ON public.payment_attempts
  FOR SELECT
  USING (get_my_claim('user_role')::text = '"admin"');
