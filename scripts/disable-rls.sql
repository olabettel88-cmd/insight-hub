-- PKA291 OSINT Platform - Disable RLS for Admin Dashboard Testing
-- Run this in Supabase SQL Editor to disable all RLS policies
-- WARNING: This removes all row-level security - only use for testing!

-- Disable RLS on all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE api_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE search_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE ip_intelligence DISABLE ROW LEVEL SECURITY;
ALTER TABLE device_fingerprints DISABLE ROW LEVEL SECURITY;
ALTER TABLE suspicious_activity DISABLE ROW LEVEL SECURITY;
ALTER TABLE multi_account_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE request_quota DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE referrals DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges DISABLE ROW LEVEL SECURITY;

-- Grant full access to anon and authenticated roles
GRANT ALL ON users TO anon, authenticated;
GRANT ALL ON sessions TO anon, authenticated;
GRANT ALL ON admins TO anon, authenticated;
GRANT ALL ON api_config TO anon, authenticated;
GRANT ALL ON activity_logs TO anon, authenticated;
GRANT ALL ON search_history TO anon, authenticated;
GRANT ALL ON ip_intelligence TO anon, authenticated;
GRANT ALL ON device_fingerprints TO anon, authenticated;
GRANT ALL ON suspicious_activity TO anon, authenticated;
GRANT ALL ON multi_account_links TO anon, authenticated;
GRANT ALL ON request_quota TO anon, authenticated;
GRANT ALL ON admin_audit_logs TO anon, authenticated;
GRANT ALL ON payment_history TO anon, authenticated;
GRANT ALL ON referrals TO anon, authenticated;
GRANT ALL ON user_badges TO anon, authenticated;

-- Confirmation
SELECT 'RLS disabled on all tables' as status;
