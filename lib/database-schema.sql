-- PKA291 OSINT Platform - Complete Database Schema with RLS Policies
-- This SQL file should be executed in the Supabase SQL Editor

-- =====================================================
-- ENABLE UUID EXTENSION
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash TEXT NOT NULL,
  subscription_plan VARCHAR(20) DEFAULT 'free',
  subscription_started_at TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,
  daily_search_limit INTEGER DEFAULT 1,
  daily_searches_used INTEGER DEFAULT 0,
  last_search_reset TIMESTAMPTZ DEFAULT NOW(),
  api_key VARCHAR(64) UNIQUE NOT NULL,
  telegram_code VARCHAR(10),
  telegram_id BIGINT,
  is_active BOOLEAN DEFAULT true,
  is_banned BOOLEAN DEFAULT false,
  ban_reason TEXT,
  badge_level VARCHAR(20) DEFAULT 'newcomer',
  referral_code VARCHAR(20) UNIQUE,
  referred_by UUID REFERENCES users(id),
  referral_earnings DECIMAL(10,2) DEFAULT 0,
  total_referrals INTEGER DEFAULT 0,
  device_fingerprint TEXT,
  last_known_ip INET,
  risk_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SESSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(64) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  device_fingerprint TEXT,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ NOT NULL,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ADMINS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'moderator',
  permissions JSONB DEFAULT '{}',
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- API CONFIG TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS api_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_name VARCHAR(100) NOT NULL,
  api_url TEXT NOT NULL,
  api_key TEXT,
  rate_limit INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES admins(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ACTIVITY LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  endpoint TEXT,
  query_string TEXT,
  response_status INTEGER,
  response_time_ms INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SEARCH HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  query_type VARCHAR(50) NOT NULL,
  query_value TEXT NOT NULL,
  api_used VARCHAR(100),
  results_count INTEGER DEFAULT 0,
  found_data BOOLEAN DEFAULT false,
  search_duration_ms INTEGER,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- IP INTELLIGENCE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS ip_intelligence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address INET UNIQUE NOT NULL,
  country_code VARCHAR(5),
  country_name VARCHAR(100),
  city VARCHAR(100),
  isp VARCHAR(200),
  is_vpn BOOLEAN DEFAULT false,
  is_proxy BOOLEAN DEFAULT false,
  is_tor BOOLEAN DEFAULT false,
  is_datacenter BOOLEAN DEFAULT false,
  threat_level VARCHAR(20) DEFAULT 'low',
  threat_score INTEGER DEFAULT 0,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  total_requests INTEGER DEFAULT 1
);

-- =====================================================
-- DEVICE FINGERPRINTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS device_fingerprints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fingerprint_hash VARCHAR(64) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  browser_info JSONB,
  screen_info JSONB,
  hardware_info JSONB,
  timezone VARCHAR(100),
  language VARCHAR(20),
  platform VARCHAR(50),
  is_suspicious BOOLEAN DEFAULT false,
  risk_factors JSONB DEFAULT '[]',
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  total_uses INTEGER DEFAULT 1
);

-- =====================================================
-- SUSPICIOUS ACTIVITY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS suspicious_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  activity_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) DEFAULT 'medium',
  description TEXT,
  ip_address INET,
  device_fingerprint TEXT,
  metadata JSONB DEFAULT '{}',
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES admins(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- MULTI-ACCOUNT DETECTION TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS multi_account_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  primary_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  linked_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  link_type VARCHAR(50) NOT NULL,
  confidence_score INTEGER DEFAULT 0,
  evidence JSONB DEFAULT '[]',
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by UUID REFERENCES admins(id),
  reviewed_at TIMESTAMPTZ,
  is_confirmed BOOLEAN,
  UNIQUE(primary_user_id, linked_user_id)
);

-- =====================================================
-- REQUEST QUOTA TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS request_quota (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  daily_limit INTEGER DEFAULT 1,
  daily_used INTEGER DEFAULT 0,
  monthly_limit INTEGER DEFAULT 30,
  monthly_used INTEGER DEFAULT 0,
  last_daily_reset TIMESTAMPTZ DEFAULT NOW(),
  last_monthly_reset TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ADMIN AUDIT LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PAYMENT HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  order_id VARCHAR(128) UNIQUE NOT NULL,
  payment_provider VARCHAR(50) DEFAULT 'heleket',
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  crypto_currency VARCHAR(20),
  crypto_amount DECIMAL(20,8),
  payment_status VARCHAR(50) DEFAULT 'pending',
  plan_id VARCHAR(50),
  transaction_hash TEXT,
  payment_address TEXT,
  webhook_received BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  expires_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- REFERRALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  referral_code VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  reward_amount DECIMAL(10,2) DEFAULT 0,
  reward_paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- USER BADGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_type VARCHAR(50) NOT NULL,
  badge_name VARCHAR(100) NOT NULL,
  badge_description TEXT,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_type)
);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ip_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_fingerprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE suspicious_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE multi_account_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_quota ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can view own data" ON users;
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Admins can view all users" ON users;
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id::text = auth.uid()::text)
  );

DROP POLICY IF EXISTS "Admins can update all users" ON users;
CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id::text = auth.uid()::text)
  );

DROP POLICY IF EXISTS "Service role full access users" ON users;
CREATE POLICY "Service role full access users" ON users
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- SESSIONS TABLE POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can view own sessions" ON sessions;
CREATE POLICY "Users can view own sessions" ON sessions
  FOR SELECT USING (user_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Users can manage own sessions" ON sessions;
CREATE POLICY "Users can manage own sessions" ON sessions
  FOR ALL USING (user_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Admins can view all sessions" ON sessions;
CREATE POLICY "Admins can view all sessions" ON sessions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id::text = auth.uid()::text)
  );

DROP POLICY IF EXISTS "Service role full access sessions" ON sessions;
CREATE POLICY "Service role full access sessions" ON sessions
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- ADMINS TABLE POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Admins can view admin table" ON admins;
CREATE POLICY "Admins can view admin table" ON admins
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins a WHERE a.user_id::text = auth.uid()::text)
  );

DROP POLICY IF EXISTS "Super admins can manage admins" ON admins;
CREATE POLICY "Super admins can manage admins" ON admins
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins a WHERE a.user_id::text = auth.uid()::text AND a.role = 'super_admin')
  );

DROP POLICY IF EXISTS "Service role full access admins" ON admins;
CREATE POLICY "Service role full access admins" ON admins
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- API CONFIG TABLE POLICIES (Admin only)
-- =====================================================
DROP POLICY IF EXISTS "Admins can view api_config" ON api_config;
CREATE POLICY "Admins can view api_config" ON api_config
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id::text = auth.uid()::text)
  );

DROP POLICY IF EXISTS "Admins can manage api_config" ON api_config;
CREATE POLICY "Admins can manage api_config" ON api_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id::text = auth.uid()::text)
  );

DROP POLICY IF EXISTS "Service role full access api_config" ON api_config;
CREATE POLICY "Service role full access api_config" ON api_config
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- ACTIVITY LOGS TABLE POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can view own activity" ON activity_logs;
CREATE POLICY "Users can view own activity" ON activity_logs
  FOR SELECT USING (user_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Admins can view all activity" ON activity_logs;
CREATE POLICY "Admins can view all activity" ON activity_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id::text = auth.uid()::text)
  );

DROP POLICY IF EXISTS "Service role full access activity" ON activity_logs;
CREATE POLICY "Service role full access activity" ON activity_logs
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- SEARCH HISTORY TABLE POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can view own searches" ON search_history;
CREATE POLICY "Users can view own searches" ON search_history
  FOR SELECT USING (user_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Admins can view all searches" ON search_history;
CREATE POLICY "Admins can view all searches" ON search_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id::text = auth.uid()::text)
  );

DROP POLICY IF EXISTS "Service role full access searches" ON search_history;
CREATE POLICY "Service role full access searches" ON search_history
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- IP INTELLIGENCE TABLE POLICIES (Admin only)
-- =====================================================
DROP POLICY IF EXISTS "Admins can view ip_intelligence" ON ip_intelligence;
CREATE POLICY "Admins can view ip_intelligence" ON ip_intelligence
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id::text = auth.uid()::text)
  );

DROP POLICY IF EXISTS "Admins can manage ip_intelligence" ON ip_intelligence;
CREATE POLICY "Admins can manage ip_intelligence" ON ip_intelligence
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id::text = auth.uid()::text)
  );

DROP POLICY IF EXISTS "Service role full access ip_intelligence" ON ip_intelligence;
CREATE POLICY "Service role full access ip_intelligence" ON ip_intelligence
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- DEVICE FINGERPRINTS TABLE POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can view own fingerprints" ON device_fingerprints;
CREATE POLICY "Users can view own fingerprints" ON device_fingerprints
  FOR SELECT USING (user_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Admins can view all fingerprints" ON device_fingerprints;
CREATE POLICY "Admins can view all fingerprints" ON device_fingerprints
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id::text = auth.uid()::text)
  );

DROP POLICY IF EXISTS "Service role full access fingerprints" ON device_fingerprints;
CREATE POLICY "Service role full access fingerprints" ON device_fingerprints
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- SUSPICIOUS ACTIVITY TABLE POLICIES (Admin only)
-- =====================================================
DROP POLICY IF EXISTS "Admins can view suspicious_activity" ON suspicious_activity;
CREATE POLICY "Admins can view suspicious_activity" ON suspicious_activity
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id::text = auth.uid()::text)
  );

DROP POLICY IF EXISTS "Admins can manage suspicious_activity" ON suspicious_activity;
CREATE POLICY "Admins can manage suspicious_activity" ON suspicious_activity
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id::text = auth.uid()::text)
  );

DROP POLICY IF EXISTS "Service role full access suspicious" ON suspicious_activity;
CREATE POLICY "Service role full access suspicious" ON suspicious_activity
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- MULTI-ACCOUNT LINKS TABLE POLICIES (Admin only)
-- =====================================================
DROP POLICY IF EXISTS "Admins can view multi_account" ON multi_account_links;
CREATE POLICY "Admins can view multi_account" ON multi_account_links
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id::text = auth.uid()::text)
  );

DROP POLICY IF EXISTS "Admins can manage multi_account" ON multi_account_links;
CREATE POLICY "Admins can manage multi_account" ON multi_account_links
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id::text = auth.uid()::text)
  );

DROP POLICY IF EXISTS "Service role full access multi_account" ON multi_account_links;
CREATE POLICY "Service role full access multi_account" ON multi_account_links
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- REQUEST QUOTA TABLE POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can view own quota" ON request_quota;
CREATE POLICY "Users can view own quota" ON request_quota
  FOR SELECT USING (user_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Admins can manage quotas" ON request_quota;
CREATE POLICY "Admins can manage quotas" ON request_quota
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id::text = auth.uid()::text)
  );

DROP POLICY IF EXISTS "Service role full access quota" ON request_quota;
CREATE POLICY "Service role full access quota" ON request_quota
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- ADMIN AUDIT LOGS TABLE POLICIES (Admin only)
-- =====================================================
DROP POLICY IF EXISTS "Admins can view audit logs" ON admin_audit_logs;
CREATE POLICY "Admins can view audit logs" ON admin_audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id::text = auth.uid()::text)
  );

DROP POLICY IF EXISTS "Service role full access audit" ON admin_audit_logs;
CREATE POLICY "Service role full access audit" ON admin_audit_logs
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- PAYMENT HISTORY TABLE POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can view own payments" ON payment_history;
CREATE POLICY "Users can view own payments" ON payment_history
  FOR SELECT USING (user_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Admins can view all payments" ON payment_history;
CREATE POLICY "Admins can view all payments" ON payment_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id::text = auth.uid()::text)
  );

DROP POLICY IF EXISTS "Service role full access payments" ON payment_history;
CREATE POLICY "Service role full access payments" ON payment_history
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- REFERRALS TABLE POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can view own referrals" ON referrals;
CREATE POLICY "Users can view own referrals" ON referrals
  FOR SELECT USING (
    referrer_id::text = auth.uid()::text OR referred_id::text = auth.uid()::text
  );

DROP POLICY IF EXISTS "Admins can manage referrals" ON referrals;
CREATE POLICY "Admins can manage referrals" ON referrals
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id::text = auth.uid()::text)
  );

DROP POLICY IF EXISTS "Service role full access referrals" ON referrals;
CREATE POLICY "Service role full access referrals" ON referrals
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- USER BADGES TABLE POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can view own badges" ON user_badges;
CREATE POLICY "Users can view own badges" ON user_badges
  FOR SELECT USING (user_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Public can view badges" ON user_badges;
CREATE POLICY "Public can view badges" ON user_badges
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage badges" ON user_badges;
CREATE POLICY "Admins can manage badges" ON user_badges
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id::text = auth.uid()::text)
  );

DROP POLICY IF EXISTS "Service role full access badges" ON user_badges;
CREATE POLICY "Service role full access badges" ON user_badges
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to mask API keys
CREATE OR REPLACE FUNCTION mask_api_key(key TEXT) RETURNS TEXT AS $$
BEGIN
  IF key IS NULL OR LENGTH(key) < 8 THEN
    RETURN '****';
  END IF;
  RETURN SUBSTRING(key, 1, 4) || '****' || SUBSTRING(key FROM LENGTH(key) - 3);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate user risk score
CREATE OR REPLACE FUNCTION calculate_user_risk_score(p_user_id UUID) RETURNS INTEGER AS $$
DECLARE
  v_risk_score INTEGER := 0;
  v_multi_accounts INTEGER;
  v_suspicious_count INTEGER;
  v_vpn_usage BOOLEAN;
BEGIN
  SELECT COUNT(*) INTO v_multi_accounts
  FROM multi_account_links
  WHERE primary_user_id = p_user_id OR linked_user_id = p_user_id;
  
  SELECT COUNT(*) INTO v_suspicious_count
  FROM suspicious_activity
  WHERE user_id = p_user_id AND is_resolved = false;
  
  v_risk_score := v_risk_score + (v_multi_accounts * 20);
  v_risk_score := v_risk_score + (v_suspicious_count * 15);
  
  IF v_risk_score > 100 THEN
    v_risk_score := 100;
  END IF;
  
  RETURN v_risk_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-detect multi-accounts by IP
CREATE OR REPLACE FUNCTION detect_multi_account_by_ip() RETURNS TRIGGER AS $$
DECLARE
  v_existing_user UUID;
BEGIN
  IF NEW.ip_address IS NOT NULL THEN
    SELECT user_id INTO v_existing_user
    FROM sessions
    WHERE ip_address = NEW.ip_address
      AND user_id != NEW.user_id
      AND is_active = true
    LIMIT 1;
    
    IF v_existing_user IS NOT NULL THEN
      INSERT INTO multi_account_links (primary_user_id, linked_user_id, link_type, confidence_score, evidence)
      VALUES (v_existing_user, NEW.user_id, 'same_ip', 60, jsonb_build_array(
        jsonb_build_object('type', 'ip_match', 'ip', NEW.ip_address::text, 'detected_at', NOW())
      ))
      ON CONFLICT (primary_user_id, linked_user_id) DO UPDATE
      SET confidence_score = multi_account_links.confidence_score + 10,
          evidence = multi_account_links.evidence || jsonb_build_array(
            jsonb_build_object('type', 'ip_match', 'ip', NEW.ip_address::text, 'detected_at', NOW())
          );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for multi-account detection
DROP TRIGGER IF EXISTS detect_multi_account_trigger ON sessions;
CREATE TRIGGER detect_multi_account_trigger
  AFTER INSERT ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION detect_multi_account_by_ip();

-- Function to clean expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions() RETURNS void AS $$
BEGIN
  DELETE FROM sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_api_key ON users(api_key);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at);
CREATE INDEX IF NOT EXISTS idx_ip_intelligence_ip ON ip_intelligence(ip_address);
CREATE INDEX IF NOT EXISTS idx_device_fingerprints_hash ON device_fingerprints(fingerprint_hash);
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_order_id ON payment_history(order_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_suspicious_activity_user_id ON suspicious_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_multi_account_primary ON multi_account_links(primary_user_id);
