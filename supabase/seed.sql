-- Insert sample tracking events for testing
INSERT INTO order_tracking (order_number, status, message, location, timestamp)
VALUES 
  ('MH-SAMPLE001', 'pending', 'Order received and awaiting processing', 'Denver, CO', NOW() - INTERVAL '2 days'),
  ('MH-SAMPLE001', 'processing', 'Payment confirmed, preparing hardware', 'Denver, CO', NOW() - INTERVAL '1 day'),
  ('MH-SAMPLE001', 'processing', 'Hardware tested and ready for shipment', 'Denver, CO', NOW() - INTERVAL '12 hours');
