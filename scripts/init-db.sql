-- OSINT Platform Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (simplified - username + password only)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  subscription_plan VARCHAR(50) DEFAULT 'free', -- free, monthly, quarterly, yearly, lifetime
  subscription_started_at TIMESTAMP,
  subscription_ends_at TIMESTAMP,
  daily_search_limit INT DEFAULT 1,
  daily_searches_used INT DEFAULT 0,
  last_search_reset TIMESTAMP DEFAULT NOW(),
  api_key VARCHAR(255) UNIQUE DEFAULT gen_random_uuid()::text,
  telegram_code VARCHAR(10) UNIQUE,
  telegram_id VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  is_banned BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Referral Program table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referral_code VARCHAR(20) UNIQUE NOT NULL,
  discount_percentage INT DEFAULT 25,
  discount_active BOOLEAN DEFAULT true,
  used_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Admin users table (for hidden admin access)
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_admin BOOLEAN DEFAULT false,
  is_staff BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- API Configuration table (hidden from users)
CREATE TABLE IF NOT EXISTS api_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_name VARCHAR(255) NOT NULL,
  api_url VARCHAR(512) NOT NULL,
  api_key VARCHAR(512),
  is_active BOOLEAN DEFAULT true,
  rate_limit INT DEFAULT 100,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User Activity Logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(255) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  endpoint VARCHAR(255),
  query_string TEXT,
  response_status INT,
  response_time_ms INT,
  metadata JSON DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_ip_address (ip_address)
);

-- Search History table
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  query_type VARCHAR(100), -- email, breach, domain, etc.
  query_value TEXT NOT NULL,
  api_used VARCHAR(255),
  results_count INT,
  found_data JSONB,
  is_premium_result BOOLEAN DEFAULT false,
  search_duration_ms INT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_query_value (query_value)
);

-- IP Address Detection & Behavior table
CREATE TABLE IF NOT EXISTS ip_intelligence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address INET UNIQUE NOT NULL,
  country VARCHAR(100),
  city VARCHAR(100),
  isp VARCHAR(255),
  is_vpn BOOLEAN DEFAULT false,
  is_proxy BOOLEAN DEFAULT false,
  is_datacenter BOOLEAN DEFAULT false,
  threat_level VARCHAR(20), -- low, medium, high
  abuse_reports INT DEFAULT 0,
  last_seen TIMESTAMP,
  user_agent_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Suspicious Activity Detection table
CREATE TABLE IF NOT EXISTS suspicious_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  activity_type VARCHAR(100), -- rate_limit_exceeded, unusual_location, etc.
  severity VARCHAR(20), -- low, medium, high
  ip_address INET,
  description TEXT,
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES admins(id),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Request Quota table
CREATE TABLE IF NOT EXISTS request_quota (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  quota_type VARCHAR(50), -- daily, monthly, total
  limit_count INT,
  used_count INT DEFAULT 0,
  reset_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id, quota_type)
);

-- Admin Audit Log table
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES admins(id),
  action VARCHAR(255) NOT NULL,
  target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  target_type VARCHAR(100), -- user, api_config, settings, etc.
  changes JSONB,
  reason TEXT,
  ip_address INET,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_admin_id (admin_id),
  INDEX idx_created_at (created_at)
);

-- Payment History table
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'USD',
  plan VARCHAR(50),
  duration_months INT,
  stripe_payment_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed, refunded
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_telegram_code ON users(telegram_code);
CREATE INDEX idx_admins_user_id ON admins(user_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_search_history_user_id ON search_history(user_id);
CREATE INDEX idx_suspicious_activity_user_id ON suspicious_activity(user_id);
CREATE INDEX idx_request_quota_user_id ON request_quota(user_id);
CREATE INDEX idx_admin_audit_logs_admin_id ON admin_audit_logs(admin_id);
CREATE INDEX idx_payment_history_user_id ON payment_history(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE ip_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE suspicious_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_quota ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own data
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Activity logs - users can see their own, admins see all
CREATE POLICY "Users can view their own activity" ON activity_logs
  FOR SELECT USING (
    auth.uid()::text = user_id::text OR
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()::text)
  );

-- Search history - users can see their own, admins see all
CREATE POLICY "Users can view their own search history" ON search_history
  FOR SELECT USING (
    auth.uid()::text = user_id::text OR
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()::text)
  );

-- Only admins can access admin tables
CREATE POLICY "Only admins can access" ON admins
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()::text)
  );

CREATE POLICY "Only admins can access api config" ON api_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()::text)
  );

-- Insert default admin user (if needed)
-- Password should be hashed with bcrypt before inserting
INSERT INTO users (username, email, password_hash, full_name, is_active)
VALUES ('admin_default', 'admin@osint-platform.local', '', 'System Admin', true)
ON CONFLICT DO NOTHING;
