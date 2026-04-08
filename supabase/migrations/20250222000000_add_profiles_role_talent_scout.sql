-- Add role to profiles for Talent Scout (and future) access control.
-- Only 'user' and 'talent_scout' are allowed; default is 'user'.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'talent_scout'));

-- Backfill existing rows (in case default was not applied)
UPDATE public.profiles SET role = 'user' WHERE role IS NULL;

-- Prevent users from changing their own role (only service_role or direct SQL can grant talent_scout).
-- This blocks privilege escalation via the client.
CREATE OR REPLACE FUNCTION public.prevent_role_self_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    -- Only allow role change when called with elevated privileges (e.g. service role or migration).
    IF (auth.jwt() ->> 'role') = 'service_role' THEN
      RETURN NEW;
    END IF;
    -- Otherwise keep the previous role (block client from changing it).
    NEW.role := OLD.role;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_profiles_role_self_update ON public.profiles;
CREATE TRIGGER prevent_profiles_role_self_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_self_update();

-- Optional: comment for admins on how to grant scout access
COMMENT ON COLUMN public.profiles.role IS 'User role: user (default) or talent_scout. Set talent_scout via Dashboard SQL or service_role only.';
