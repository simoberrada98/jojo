-- Create coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'free_shipping')),
  discount_value DECIMAL(10, 2) NOT NULL,
  min_order_amount DECIMAL(10, 2) DEFAULT 0,
  max_uses INTEGER,
  uses INTEGER DEFAULT 0,
  start_at TIMESTAMP WITH TIME ZONE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Ensure end date is after start date
  CONSTRAINT valid_dates CHECK (expires_at > start_at)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons (code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON public.coupons (active) WHERE active = true;

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Enable read access for all users" 
ON public.coupons 
FOR SELECT 
TO authenticated, anon
USING (active = true AND NOW() BETWEEN start_at AND expires_at);

CREATE POLICY "Enable all for admin" 
ON public.coupons 
TO service_role
USING (true) WITH CHECK (true);

-- Insert sample data (optional, for development)
INSERT INTO public.coupons (
  code, 
  description, 
  discount_type, 
  discount_value, 
  min_order_amount, 
  max_uses, 
  start_at, 
  expires_at, 
  active
) VALUES 
('HALLOMINE26', 'Halloween extra $50 off + up to 75% seasonal deals', 'fixed', 50.00, 5000.00, 1000, '2025-10-25T00:00:00Z', '2025-11-02T23:59:00Z', true),
('WELCOME10', 'Welcome to our store - 10% off your first order', 'percentage', 10.00, 0.00, NULL, '2025-01-01T00:00:00Z', '2026-12-31T23:59:59Z', true),
('FREESHIP', 'Free standard shipping on your order', 'free_shipping', 0.00, 0.00, 5000, '2025-01-01T00:00:00Z', '2026-12-31T23:59:59Z', true)
ON CONFLICT (code) DO NOTHING;
