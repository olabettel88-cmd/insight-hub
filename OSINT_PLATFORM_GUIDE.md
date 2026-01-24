# OSINT Platform - Complete Implementation Guide

## Overview

This is a comprehensive, enterprise-grade OSINT (Open Source Intelligence) platform with military-grade security, advanced logging, hidden admin controls, and Telegram bot integration.

## Key Features

### 1. User Authentication & Management
- Secure username/password authentication with SHA-256 hashing
- User registration with email verification
- Unique telegram connection codes for each user
- API keys for programmatic access
- Daily search limits based on subscription plan

### 2. User Dashboard
- Advanced OSINT search interface (email, domain, username, phone)
- Search history tracking
- Real-time results with JSON formatting
- Daily search limit monitoring
- Account settings with API key management
- Telegram code for bot connection

### 3. Admin Dashboard (Hidden Route)
Located at: `/x7f3k9m2q1w0r4t8y5u6i7o8p9a0s1d2f3g4h5j6k7l8z9x0c1v2b3n4m5q6w7e8r9t0y1`
- Password-protected access
- API configuration management
- Add/edit/delete API endpoints
- User statistics dashboard
- Activity monitoring
- User banning and suspension

### 4. Advanced Logging System
All logged activities include:
- IP address detection with geolocation
- User agent tracking
- Search query logging
- Response times and status codes
- Behavioral analysis
- Suspicious activity detection
- Audit trails for admin actions

### 5. Telegram Bot Integration
Features:
- `/start` - Welcome message
- `/link CODE` - Link account with connection code
- `/search TYPE QUERY` - Perform searches from Telegram
- `/status` - Check account status
- `/help` - Show available commands

### 6. Security Measures
- Rate limiting on login (5 attempts per 15 minutes)
- SQL injection prevention via parameterized queries
- XSS protection through React escaping
- CSRF tokens for state-changing operations
- Hidden admin routes with obscured paths
- Comprehensive activity logging
- IP-based threat detection
- User banning system

### 7. Pricing Plans
- **Monthly**: $20/month - 30 searches
- **Quarterly**: $50/3 months - 100 searches
- **Yearly**: $100/year - 500 searches
- **Lifetime**: $300 one-time - Unlimited searches
- **Free**: 1 search per day

## Setup Instructions

### 1. Database Setup

Execute the migration script to set up the database:

```bash
# Using Supabase CLI
supabase db push scripts/init-db.sql

# Or manually in Supabase dashboard
# Copy contents of scripts/init-db.sql into SQL editor and execute
```

### 2. Environment Variables

Create/update your `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Admin Password (change this!)
ADMIN_PASSWORD=admin123secure
ADMIN_SECRET=super_secret_admin_key_12345

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

### 3. Telegram Bot Setup

```bash
node scripts/telegram-bot-setup.js "YOUR_BOT_TOKEN" "https://yourdomain.com/api/telegram/webhook"
```

This script will:
- Set the webhook URL
- Get bot information
- Configure bot commands
- Show setup summary

### 4. Running the Application

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

## Architecture

### Database Schema

Key tables:
- **users** - User accounts and subscription info
- **admins** - Admin users and their roles
- **api_config** - API endpoint configurations (hidden from users)
- **activity_logs** - All user activities
- **search_history** - Search queries and results
- **ip_intelligence** - IP tracking and threat analysis
- **suspicious_activity** - Flagged suspicious behavior
- **admin_audit_logs** - All admin actions
- **payment_history** - Subscription payments

### API Routes

#### Public Routes
- `GET /` - Homepage
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /pricing` - Pricing page

#### Protected Routes (User)
- `GET /api/users/[id]` - User profile
- `POST /api/search` - Perform search
- `GET /dashboard` - User dashboard

#### Admin Routes (Hidden)
- `POST /api/admin/verify` - Admin authentication
- `GET /api/admin/stats` - Dashboard statistics
- `POST /api/admin/api-config` - Add API
- `DELETE /api/admin/api-config/[id]` - Delete API

#### Telegram Routes
- `POST /api/telegram/webhook` - Telegram webhook

### Color Scheme (Red-Focused)

- **Primary**: #dc2626 (Red)
- **Accent**: #ef4444 (Light Red)
- **Background**: #0a0a0a (Dark)
- **Card**: #141414 (Slightly lighter dark)
- **Foreground**: #fafafa (Off-white text)
- **Muted**: #3f3f3f (Gray for secondary text)

## Usage Guide

### For Users

1. **Create Account**
   - Visit `/register`
   - Provide username, email, password
   - Receive unique telegram code

2. **Perform Searches**
   - Go to `/dashboard`
   - Select search type (email, domain, username, phone)
   - Enter query
   - View results

3. **Connect Telegram**
   - Find your telegram code in dashboard settings
   - Start Telegram bot
   - Send `/link CODE`
   - Use bot for searches

4. **Upgrade Plan**
   - Visit `/pricing`
   - Choose plan
   - Proceed to checkout
   - Plan becomes active immediately

### For Admins

1. **Access Admin Panel**
   - Navigate to `/x7f3k9m2q1w0r4t8y5u6i7o8p9a0s1d2f3g4h5j6k7l8z9x0c1v2b3n4m5q6w7e8r9t0y1`
   - Enter admin password
   - Access control panel

2. **Manage API Endpoints**
   - View all active API configurations
   - Add new API (breach.rip, intelx, etc.)
   - Set rate limits
   - Delete inactive APIs

3. **Monitor System**
   - View user statistics
   - Check activity logs
   - Identify suspicious activities
   - Monitor IP addresses

4. **User Management**
   - Ban users
   - Suspend accounts
   - Reset quotas
   - View user activity

## Security Best Practices

1. **Change Default Credentials**
   - Update `ADMIN_PASSWORD` in environment
   - Update `ADMIN_SECRET` to a strong random string

2. **API Keys**
   - Store API keys securely in database
   - Never log API keys
   - Rotate keys regularly

3. **Rate Limiting**
   - Login attempts limited to 5 per 15 minutes
   - API requests subject to configured limits
   - Daily search limits per plan

4. **Activity Monitoring**
   - All searches logged with IP, user agent
   - Suspicious patterns detected automatically
   - Admin actions fully audited
   - Activity logs retained for 90 days

5. **Data Protection**
   - All passwords hashed with SHA-256
   - HTTPS enforced in production
   - No sensitive data in logs
   - GDPR compliance for EU users

## Customization Guide

### Changing Admin Route
The admin route is intentionally obscured. To change it:

1. Rename the folder from `x7f3k9m2q1w0r4t8y5u6i7o8p9a0s1d2f3g4h5j6k7l8z9x0c1v2b3n4m5q6w7e8r9t0y1` to your custom path
2. Update any hardcoded links if necessary

### Adding New Search Types
Edit `/app/dashboard/page.tsx` and add to the SelectContent:

```tsx
<SelectItem value="custom_type">Custom Search Type</SelectItem>
```

### Changing API Provider
Instead of hardcoding, manage via admin panel:

1. Login to admin dashboard
2. Add new API configuration with endpoint URL
3. System automatically uses configured API

### Modifying Pricing
Edit `/app/pricing/page.tsx` and update the `plans` array.

### Telegram Bot Commands
Modify `/app/api/telegram/webhook/route.ts` to add/change bot commands.

## Deployment

### Deploy to Vercel
```bash
git push origin main
# Vercel automatically deploys

# Don't forget to add environment variables:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - ADMIN_PASSWORD
# - TELEGRAM_BOT_TOKEN
```

### Self-Host (Node.js)
```bash
npm run build
npm start
```

### Docker
Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
CMD ["npm", "start"]
```

## Troubleshooting

### Authentication Issues
- Check `ADMIN_PASSWORD` in environment variables
- Verify Supabase connection
- Check browser console for auth errors

### Telegram Bot Not Responding
- Verify `TELEGRAM_BOT_TOKEN` is correct
- Check webhook URL is accessible
- Ensure `/api/telegram/webhook` is deployed
- Run bot setup script again

### Search Not Working
- Check API configuration in admin panel
- Verify API key is correct
- Check rate limits haven't been exceeded
- Review activity logs for errors

### Database Connection Errors
- Verify Supabase URL and key are correct
- Check database is running
- Review RLS policies are properly configured

## API Documentation

### Search Endpoint

**POST** `/api/search`

Headers:
```json
{
  "Authorization": "Bearer YOUR_TOKEN",
  "Content-Type": "application/json"
}
```

Body:
```json
{
  "query": "user@example.com",
  "type": "email"
}
```

Response:
```json
{
  "id": "search_id",
  "query": "user@example.com",
  "type": "email",
  "results": {},
  "timestamp": "2024-01-24T12:00:00Z"
}
```

### User Profile Endpoint

**GET** `/api/users/[id]`

Headers:
```json
{
  "Authorization": "Bearer YOUR_TOKEN"
}
```

Response:
```json
{
  "id": "user_id",
  "username": "john_doe",
  "email": "john@example.com",
  "planType": "monthly",
  "telegramCode": "ABC123",
  "apiKey": "key_xxx",
  "searchesUsed": 3,
  "searchesLimit": 30
}
```

## Support

For issues or questions:
1. Check activity logs in admin panel
2. Review database for errors
3. Check environment variables
4. Review browser console for client-side errors
5. Check server logs for API errors

## License

This OSINT Platform is provided for authorized intelligence gathering and security research purposes only. Users are responsible for ensuring compliance with all applicable laws and regulations.

## Security Notice

This platform contains sensitive features including hidden admin routes, comprehensive logging, and user monitoring. Ensure:
- Strong admin passwords
- Regular security audits
- Compliance with local regulations
- Proper data retention policies
- Incident response procedures
