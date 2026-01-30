-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    api_key TEXT UNIQUE DEFAULT ('pka_' || md5(random()::text || clock_timestamp()::text)),
    subscription_plan TEXT DEFAULT 'free',
    subscription_ends_at TIMESTAMPTZ,
    daily_search_limit INTEGER DEFAULT 5,
    daily_searches_used INTEGER DEFAULT 0,
    last_search_reset TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    is_banned BOOLEAN DEFAULT FALSE,
    badge_level INTEGER DEFAULT 0,
    risk_score INTEGER DEFAULT 0,
    total_referrals INTEGER DEFAULT 0,
    referral_earnings DECIMAL(10, 2) DEFAULT 0.00,
    referred_by UUID REFERENCES users(id),
    referral_code TEXT UNIQUE,
    telegram_code TEXT,
    last_known_ip TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SESSIONS TABLE
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    endpoint TEXT,
    query_string TEXT,
    response_status INTEGER,
    response_time_ms INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SEARCH HISTORY TABLE
CREATE TABLE IF NOT EXISTS search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    api_name TEXT,
    result_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PAYMENT HISTORY TABLE
CREATE TABLE IF NOT EXISTS payment_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    payment_status TEXT NOT NULL, -- 'pending', 'completed', 'failed'
    transaction_id TEXT,
    provider TEXT DEFAULT 'heleket',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API CONFIG TABLE
CREATE TABLE IF NOT EXISTS api_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    api_name TEXT NOT NULL UNIQUE,
    api_url TEXT NOT NULL,
    api_key TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    rate_limit INTEGER DEFAULT 60, -- requests per minute
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUSPICIOUS ACTIVITY TABLE
CREATE TABLE IF NOT EXISTS suspicious_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    activity_type TEXT NOT NULL,
    description TEXT,
    severity TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ADMIN AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id TEXT, -- Could be system or user_id
    action TEXT NOT NULL,
    target_type TEXT,
    target_id TEXT,
    old_values JSONB,
    new_values JSONB,
    changes JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ADMINS TABLE
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    is_admin BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FUNCTIONS

-- Function to increment referral earnings
CREATE OR REPLACE FUNCTION increment_referral_earnings(user_id UUID, amount DECIMAL)
RETURNS VOID AS $$
BEGIN
    UPDATE users
    SET referral_earnings = referral_earnings + amount,
        total_referrals = total_referrals + 1
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- RLS POLICIES (Row Level Security)
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE suspicious_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Users can view their own data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own data (restricted columns usually, but simplified here)
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Public can view active APIs (needed for frontend potentially, or restrict to auth)
CREATE POLICY "Public read api config" ON api_config
    FOR SELECT USING (true);

-- Only admins can modify api config (This requires auth.uid() to be in admins table)
CREATE POLICY "Admins modify api config" ON api_config
    FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- Search history: users view their own
CREATE POLICY "Users view own search history" ON search_history
    FOR SELECT USING (auth.uid() = user_id);

-- Payment history: users view their own
CREATE POLICY "Users view own payments" ON payment_history
    FOR SELECT USING (auth.uid() = user_id);

-- Activity logs: users view their own
CREATE POLICY "Users view own activity" ON activity_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Service Role (Supabase Service Key) has full access by default, 
-- but explicit policies for 'service_role' can be added if needed.
-- Supabase handles service_role bypassing RLS automatically.

