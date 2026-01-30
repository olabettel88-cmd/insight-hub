-- Security Fixes for Supabase Vulnerabilities

-- 1. Enable RLS on public tables
ALTER TABLE IF EXISTS public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ip_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.request_quota ENABLE ROW LEVEL SECURITY;

-- 2. Fix Function Search Path Mutable
-- We use ALTER FUNCTION to set the search_path to 'public' to prevent search_path hijacking
ALTER FUNCTION public.cleanup_expired_sessions() SET search_path = public;
ALTER FUNCTION public.increment_referral_earnings(uuid, decimal) SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- 3. Add explicit policies for tables with "RLS Enabled No Policy" (INFO level)
-- Creating a policy ensures clarity that access is restricted (Deny All for anon/authenticated).
-- Service role will still have access.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'admin_audit_logs' AND policyname = 'Deny all access'
    ) THEN
        CREATE POLICY "Deny all access" ON public.admin_audit_logs FOR ALL USING (false);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'admins' AND policyname = 'Deny all access'
    ) THEN
        CREATE POLICY "Deny all access" ON public.admins FOR ALL USING (false);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'sessions' AND policyname = 'Deny all access'
    ) THEN
        CREATE POLICY "Deny all access" ON public.sessions FOR ALL USING (false);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'suspicious_activity' AND policyname = 'Deny all access'
    ) THEN
        CREATE POLICY "Deny all access" ON public.suspicious_activity FOR ALL USING (false);
    END IF;
END
$$;
