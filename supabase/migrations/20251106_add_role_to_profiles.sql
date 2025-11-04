-- Add 'role' column to public.profiles table
ALTER TABLE public.profiles
ADD COLUMN role text NOT NULL DEFAULT 'user';

-- Create a RLS policy to allow users to update their own profile, but not their role
CREATE POLICY "Users can update their own profile without changing role" ON public.profiles
FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id AND role = old.role);

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

-- Grant usage to authenticated users (if they need to call it, though typically only admins would)
-- REVOKE EXECUTE ON FUNCTION public.set_user_as_admin(uuid) FROM public;
-- GRANT EXECUTE ON FUNCTION public.set_user_as_admin(uuid) TO authenticated;

-- Revoke all from public and grant to service_role for security
REVOKE EXECUTE ON FUNCTION public.set_user_as_admin(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.set_user_as_admin(uuid) TO service_role;
