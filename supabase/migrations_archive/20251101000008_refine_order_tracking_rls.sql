DROP POLICY "Allow authenticated insert to order tracking" ON order_tracking;
CREATE POLICY "Allow admin insert to order tracking"
ON order_tracking FOR INSERT
WITH CHECK (get_my_claim('user_role')::text = '"admin"');
