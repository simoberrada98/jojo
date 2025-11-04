-- Add 'role' column to public.profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user';

-- Create a RLS policy to allow users to update their own profile, but not change role
CREATE POLICY "Users can update their own profile without changing role"
ON public.profiles
FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = id)
WITH CHECK (
  (SELECT auth.uid()) = id
  -- `role` on the left is the proposed (new) value; the subquery returns the current value in the table
  AND role = (SELECT p.role FROM public.profiles p WHERE p.id = public.profiles.id)
);

-- Optionally, create a function to set a user as admin (only callable by service role or admin)
-- This is a simplified example, in a real app you might have a more robust admin management system
CREATE OR REPLACE FUNCTION public.set_user_as_admin(user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET role = 'admin'
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Restrict execution: revoke public and grant to service_role
REVOKE EXECUTE ON FUNCTION public.set_user_as_admin(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.set_user_as_admin(uuid) TO service_role;