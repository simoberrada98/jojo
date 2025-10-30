-- Create order_tracking table for real-time order status updates
CREATE TABLE IF NOT EXISTS order_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'shipped', 'delivered')),
  message TEXT NOT NULL,
  location TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Index for faster lookups by order number
  CONSTRAINT idx_order_tracking_order_number UNIQUE (id)
);

-- Create index on order_number for faster queries
CREATE INDEX IF NOT EXISTS idx_order_tracking_order_number_timestamp 
ON order_tracking(order_number, timestamp DESC);

-- Enable Row Level Security
ALTER TABLE order_tracking ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all users to read tracking information
CREATE POLICY "Allow public read access to order tracking"
ON order_tracking FOR SELECT
USING (true);

-- Policy: Only authenticated users can insert tracking events (admin use)
CREATE POLICY "Allow authenticated insert to order tracking"
ON order_tracking FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE order_tracking;

-- Insert sample tracking events for testing
INSERT INTO order_tracking (order_number, status, message, location, timestamp)
VALUES 
  ('MH-SAMPLE001', 'pending', 'Order received and awaiting processing', 'Denver, CO', NOW() - INTERVAL '2 days'),
  ('MH-SAMPLE001', 'processing', 'Payment confirmed, preparing hardware', 'Denver, CO', NOW() - INTERVAL '1 day'),
  ('MH-SAMPLE001', 'processing', 'Hardware tested and ready for shipment', 'Denver, CO', NOW() - INTERVAL '12 hours');
