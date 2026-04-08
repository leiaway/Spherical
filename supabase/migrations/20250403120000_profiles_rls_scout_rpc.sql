-- Phase 2: Tighten profiles RLS so `role`, location, and other fields are not readable
-- via direct table SELECT on other users' rows. Social/map features use SECURITY DEFINER
-- RPCs that return only non-sensitive columns.
--
-- Phase 3 (server support): `is_talent_scout()` lets the client (and Edge Functions) check
-- scout status without fetching the full profile row over the wire.

-- Drop the permissive policy that exposed every column of every profile to any caller.
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Each user may read their own row only (includes `role` for client-side UI and RLS helpers).
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

COMMENT ON POLICY "Users can view own profile" ON public.profiles IS
  'Phase 2: Replaced public read-all; cross-user display uses public_profiles_by_ids / search_profiles_for_friends / profiles_for_user_map.';

-- Invoker reads own row under RLS; returns a single boolean (no role value in the JSON row payload from PostgREST).
CREATE OR REPLACE FUNCTION public.is_talent_scout()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT pr.role = 'talent_scout' FROM public.profiles pr WHERE pr.id = auth.uid()),
    false
  );
$$;

REVOKE ALL ON FUNCTION public.is_talent_scout() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_talent_scout() TO authenticated;

COMMENT ON FUNCTION public.is_talent_scout() IS
  'Phase 3: Prefer this over selecting `role` from profiles when only a yes/no gate is needed.';

-- Map: same rows as the old client filter (non-null lat/lng). Does not expose `role`.
CREATE OR REPLACE FUNCTION public.profiles_for_user_map()
RETURNS TABLE (
  id uuid,
  display_name text,
  avatar_url text,
  current_latitude numeric,
  current_longitude numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.display_name, p.avatar_url, p.current_latitude, p.current_longitude
  FROM public.profiles p
  WHERE p.current_latitude IS NOT NULL
    AND p.current_longitude IS NOT NULL;
$$;

REVOKE ALL ON FUNCTION public.profiles_for_user_map() FROM PUBLIC;
-- Anonymous visitors could read the map before RLS tightening; keep that behavior via RPC only.
GRANT EXECUTE ON FUNCTION public.profiles_for_user_map() TO anon;
GRANT EXECUTE ON FUNCTION public.profiles_for_user_map() TO authenticated;

COMMENT ON FUNCTION public.profiles_for_user_map() IS
  'Phase 2: Public-safe map payload; realtime on profiles no longer works for guests under strict RLS, so the app polls this RPC.';

-- Friend search: only authenticated; `exclude_user_id` must match caller to limit abuse.
CREATE OR REPLACE FUNCTION public.search_profiles_for_friends(search_term text, exclude_user_id uuid)
RETURNS TABLE (
  id uuid,
  display_name text,
  avatar_url text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF exclude_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'exclude_user_id must match the current user';
  END IF;
  IF trim(COALESCE(search_term, '')) = '' THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT p.id, p.display_name, p.avatar_url
  FROM public.profiles p
  WHERE p.display_name IS NOT NULL
    AND p.display_name ILIKE ('%' || trim(search_term) || '%')
    AND p.id <> exclude_user_id
  LIMIT 10;
END;
$$;

REVOKE ALL ON FUNCTION public.search_profiles_for_friends(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_profiles_for_friends(text, uuid) TO authenticated;

COMMENT ON FUNCTION public.search_profiles_for_friends(text, uuid) IS
  'Phase 2: Friend discovery without exposing `role` or other private profile columns.';

-- Batch resolve display fields for friend/share UIs.
CREATE OR REPLACE FUNCTION public.public_profiles_by_ids(profile_ids uuid[])
RETURNS TABLE (
  id uuid,
  display_name text,
  avatar_url text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF profile_ids IS NULL OR cardinality(profile_ids) = 0 THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT p.id, p.display_name, p.avatar_url
  FROM public.profiles p
  WHERE p.id = ANY(profile_ids);
END;
$$;

REVOKE ALL ON FUNCTION public.public_profiles_by_ids(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.public_profiles_by_ids(uuid[]) TO authenticated;

COMMENT ON FUNCTION public.public_profiles_by_ids(uuid[]) IS
  'Phase 2: Enrich friendships / playlist shares with public profile fields only.';

-- Helper for future scout-only tables: reusable in RLS policies (SECURITY DEFINER reads profiles).
CREATE OR REPLACE FUNCTION public.current_user_is_talent_scout()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT pr.role = 'talent_scout' FROM public.profiles pr WHERE pr.id = auth.uid()),
    false
  );
$$;

REVOKE ALL ON FUNCTION public.current_user_is_talent_scout() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_is_talent_scout() TO authenticated;

COMMENT ON FUNCTION public.current_user_is_talent_scout() IS
  'Phase 2: Use in future RLS (e.g. USING (public.current_user_is_talent_scout())) for scout-only data.';
