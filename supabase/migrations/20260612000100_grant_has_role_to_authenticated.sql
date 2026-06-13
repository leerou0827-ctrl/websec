-- RLS policies call public.has_role(...) for admin access checks.
-- Authenticated users need EXECUTE permission on the function for those
-- policies to evaluate, even though the function itself is SECURITY DEFINER.
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;
