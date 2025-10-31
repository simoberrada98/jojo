CREATE OR REPLACE FUNCTION get_my_claim(claim TEXT)
RETURNS jsonb AS $$
  SELECT coalesce(current_setting('request.jwt.claims', true)::jsonb ->> claim, null)::jsonb
$$ LANGUAGE sql STABLE;
