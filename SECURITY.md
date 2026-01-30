# Security Guidelines & Best Practices

## Critical Security Items

### 🔴 BEFORE GOING LIVE

1. **Change Admin Password**
   ```env
   ADMIN_PASSWORD=generate_a_strong_random_password_here
   # Use: openssl rand -hex 32
   ```

2. **Update Admin Secret**
   ```env
   ADMIN_SECRET=generate_another_random_secret_key_here
   # Use: openssl rand -base64 32
   ```

3. **Enable HTTPS**
   - Self-signed certificate (dev)
   - Let's Encrypt (production)
   - CloudFlare SSL (CDN)

4. **Configure Firewall**
   - Whitelist admin panel IPs
   - Rate limiting enabled
   - DDOS protection active

5. **Secure Database**
   - Strong PostgreSQL password
   - Backup encryption enabled
   - Connection over TLS
   - IP whitelist configured

6. **API Security**
   - Validate all inputs
   - Sanitize outputs
   - Rate limiting active
   - CORS properly configured

## Authentication Security

### Password Storage
```typescript
// Current: SHA-256 (not production)
import crypto from 'crypto';

// Production: Use bcrypt
npm install bcryptjs
import bcrypt from 'bcryptjs';

const hash = await bcrypt.hash(password, 10);
const valid = await bcrypt.compare(password, hash);
```

### Token Security
```typescript
// Current: Base64-encoded object (demo)
// Production: Use JWT
npm install jsonwebtoken

import jwt from 'jsonwebtoken';

const token = jwt.sign(
  { userId, role },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

### Session Management
```typescript
// Use HTTP-only cookies
response.headers.set(
  'Set-Cookie',
  `token=${token}; HttpOnly; Secure; SameSite=Strict`
);
```

## Data Protection

### Encryption at Rest
```typescript
// Encrypt sensitive fields
npm install crypto

const encrypt = (text, key) => {
  const cipher = crypto.createCipher('aes-256-cbc', key);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};
```

### SQL Injection Prevention
```typescript
// Always use parameterized queries
// Good:
const { data } = await supabase
  .from('users')
  .select()
  .eq('email', email);  // Safe

// Bad (never do this):
const query = `SELECT * FROM users WHERE email = '${email}'`;
```

### XSS Prevention
```typescript
// React escapes by default
// But sanitize user input
npm install sanitize-html

import sanitizeHtml from 'sanitize-html';
const clean = sanitizeHtml(userInput);
```

## API Security

### Rate Limiting
```typescript
// Implemented in login route
const loginAttempts = new Map();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempt = loginAttempts.get(ip);

  if (!attempt || now > attempt.reset) {
    loginAttempts.set(ip, { count: 1, reset: now + 15 * 60 * 1000 });
    return true;
  }

  if (attempt.count >= 5) {
    return false;  // Too many attempts
  }

  attempt.count++;
  return true;
}
```

### CORS Configuration
```typescript
// next.config.mjs
export default {
  headers: async () => [
    {
      source: '/api/(.*)',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: process.env.ALLOWED_ORIGIN },
        { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
        { key: 'Access-Control-Allow-Credentials', value: 'true' },
      ]
    }
  ]
}
```

### Input Validation
```typescript
// Validate all inputs
import { z } from 'zod';

const searchSchema = z.object({
  query: z.string().min(1).max(500),
  type: z.enum(['email', 'domain', 'username', 'phone']),
});

const parsed = searchSchema.safeParse(body);
if (!parsed.success) {
  return Response.json({ error: 'Invalid input' }, { status: 400 });
}
```

## Database Security

### Row-Level Security (RLS)
```sql
-- Users see only their own data
CREATE POLICY "Users can view own data" ON users
FOR SELECT USING (auth.uid()::text = id::text);

-- Admins see all data
CREATE POLICY "Admins see all" ON users
FOR SELECT USING (
  EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()::text)
);
```

### Data Masking
```sql
-- Mask sensitive data in logs
CREATE FUNCTION mask_api_key(key TEXT) RETURNS TEXT AS $$
BEGIN
  RETURN substring(key, 1, 4) || '****' || substring(key, -4);
END;
$$ LANGUAGE plpgsql;
```

### Backup Security
```bash
# Encrypt backups
gpg --symmetric backup.sql
# Compress
gzip backup.sql.gpg
# Upload to secure storage
```

## Admin Panel Security

### Password Protection
```typescript
// Verify before showing admin panel
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (password !== ADMIN_PASSWORD) {
  // Log failed attempt
  logAttempt(ip, 'admin_failed_auth');
  return { error: 'Invalid password' };
}
```

### IP Whitelisting (Optional)
```typescript
const ADMIN_IPS = ['192.168.1.1', '10.0.0.1'];

if (!ADMIN_IPS.includes(ip)) {
  logAttempt(ip, 'admin_ip_mismatch');
  return { error: 'Unauthorized IP' };
}
```

### Audit Logging
```typescript
// Log all admin actions
await supabase.from('admin_audit_logs').insert({
  admin_id: adminId,
  action: 'API_CONFIG_CHANGED',
  changes: { old: oldConfig, new: newConfig },
  ip_address: ip,
  timestamp: new Date(),
});
```

## Monitoring & Detection

### Suspicious Activity Detection
```typescript
// Detect unusual patterns
async function detectSuspiciousActivity(userId: string, ip: string) {
  const recentSearches = await getRecentSearches(userId, 5);
  
  // Flag if more than 10 searches in 5 minutes
  if (recentSearches.length > 10) {
    await flagSuspiciousActivity(userId, 'rate_spike', 'high');
  }

  // Flag if IP changed suddenly
  const lastIp = await getLastUserIp(userId);
  if (lastIp && lastIp !== ip) {
    await flagSuspiciousActivity(userId, 'ip_change', 'medium');
  }
}
```

### Intrusion Detection
```typescript
// Detect failed auth attempts
const failedAttempts = await countFailedAttempts(ip, '5m');
if (failedAttempts > 5) {
  // Block IP temporarily
  await blockIp(ip, '1h');
  // Alert admin
  await notifyAdmin(`Suspicious activity from ${ip}`);
}
```

### Log Monitoring
```typescript
// Monitor logs for security events
async function monitorSecurityLogs() {
  const criticalEvents = await supabase
    .from('activity_logs')
    .select()
    .in('action', ['AUTH_FAILURE', 'ADMIN_ACCESS', 'API_DELETE'])
    .gt('created_at', new Date(Date.now() - 3600000));  // Last hour

  for (const event of criticalEvents) {
    await alertAdmin(event);
  }
}
```

## Third-Party Security

### Telegram Bot Security
```typescript
// Verify Telegram webhook authenticity
function verifyTelegramSignature(body: string, signature: string) {
  const hash = crypto
    .createHmac('sha256', TELEGRAM_BOT_TOKEN)
    .update(body)
    .digest('hex');
  
  return hash === signature;
}
```

### API Key Rotation
```typescript
// Rotate API keys monthly
async function rotateApiKeys() {
  const configs = await supabase
    .from('api_config')
    .select()
    .lt('updated_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

  for (const config of configs) {
    const newKey = generateApiKey();
    await supabase
      .from('api_config')
      .update({ api_key: newKey })
      .eq('id', config.id);
    
    // Notify admin
    await notifyAdmin(`API key rotated for ${config.api_name}`);
  }
}
```

## Compliance

### GDPR Compliance
```typescript
// Right to deletion
async function deleteUserData(userId: string) {
  // Delete user
  await supabase.from('users').delete().eq('id', userId);
  
  // Delete activities (anonymized)
  await supabase
    .from('activity_logs')
    .update({ user_id: null })
    .eq('user_id', userId);
  
  // Delete searches
  await supabase
    .from('search_history')
    .delete()
    .eq('user_id', userId);
}

// Data export
async function exportUserData(userId: string) {
  const user = await getUser(userId);
  const activities = await getUserActivities(userId);
  const searches = await getUserSearches(userId);
  
  return { user, activities, searches };
}
```

### Data Retention Policy
```typescript
// Auto-delete old logs
async function cleanupOldLogs() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  await supabase
    .from('activity_logs')
    .delete()
    .lt('created_at', thirtyDaysAgo);
}

// Run daily
schedule.scheduleJob('0 2 * * *', cleanupOldLogs);
```

## Security Checklist

### Pre-Launch
- [ ] Admin password changed
- [ ] JWT implemented (not base64)
- [ ] Bcrypt for passwords (not SHA-256)
- [ ] HTTPS configured
- [ ] Firewall rules set
- [ ] Database backups enabled
- [ ] Rate limiting active
- [ ] CORS configured
- [ ] RLS policies enabled
- [ ] Audit logging enabled

### Post-Launch
- [ ] Daily log review
- [ ] Weekly security audit
- [ ] Monthly penetration test
- [ ] Quarterly security training
- [ ] Annual security review
- [ ] Vulnerability scanning
- [ ] Dependency updates
- [ ] Backup verification

### Ongoing
- [ ] Monitor activity dashboards
- [ ] Review admin audit logs
- [ ] Check for suspicious patterns
- [ ] Update rate limits as needed
- [ ] Rotate API keys
- [ ] Review user access
- [ ] Test incident response
- [ ] Document security events

## Incident Response

### Security Incident Procedure
1. **Identify** - Detect the issue
2. **Isolate** - Stop the damage
3. **Investigate** - Understand what happened
4. **Contain** - Prevent spread
5. **Eradicate** - Remove the threat
6. **Recover** - Restore systems
7. **Document** - Record details
8. **Communicate** - Notify users

### Emergency Procedures

**If compromised:**
1. Disable all admin accounts
2. Rotate all API keys
3. Review all recent logs
4. Block suspicious IPs
5. Notify users
6. Restore from backup
7. Run security audit

**If DDoS attack:**
1. Enable DDOS protection
2. Rate limit aggressively
3. Block attacking IPs
4. Notify provider
5. Monitor recovery

## Resources

- OWASP Top 10: https://owasp.org/Top10/
- CWE Top 25: https://cwe.mitre.org/top25/
- Security.txt: https://securitytxt.org/
- Privacy Policy: Create one!
- Terms of Service: Create one!

## Questions?

If you have security concerns:
1. Document the issue
2. Don't publicly disclose
3. Email security team
4. Allow 90 days for fix
5. Verify the patch

---

**Remember**: Security is not a one-time task, it's an ongoing process.

**Last Updated**: 2024-01-24
