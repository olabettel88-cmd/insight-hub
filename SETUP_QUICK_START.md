# OSINT Platform - Quick Start Guide

## 5-Minute Setup

### Step 1: Environment Setup
Create `.env.local` in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ADMIN_PASSWORD=your_strong_admin_password_here
ADMIN_SECRET=your_secret_key_here
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

### Step 2: Database Migration
In Supabase SQL Editor, execute: `scripts/init-db.sql`

### Step 3: Install & Run
```bash
npm install
npm run dev
```

## Access Points

| URL | Purpose | Credentials |
|-----|---------|-------------|
| http://localhost:3000 | Homepage | N/A |
| http://localhost:3000/register | Create Account | N/A |
| http://localhost:3000/login | User Login | username/password |
| http://localhost:3000/dashboard | User Dashboard | After login |
| http://localhost:3000/pricing | Pricing Page | N/A |
| http://localhost:3000/x7f3k9m2q1w0r4t8y5u6i7o8p9a0s1d2f3g4h5j6k7l8z9x0c1v2b3n4m5q6w7e8r9t0y1 | Admin Panel | Admin password |

## Telegram Bot Setup (Optional)

```bash
node scripts/telegram-bot-setup.js "YOUR_BOT_TOKEN" "https://yourdomain.com/api/telegram/webhook"
```

## Default Test Account

Create a test account via registration page:
- Username: `testuser`
- Email: `test@example.com`
- Password: `TestPass123!`

## Features Ready to Use

✅ User authentication (registration & login)  
✅ Dashboard with search interface  
✅ Admin panel (hidden route)  
✅ Advanced activity logging  
✅ Telegram bot integration  
✅ Pricing plans page  
✅ Red-themed dark UI  
✅ API endpoint management  
✅ User monitoring & quotas  
✅ Comprehensive security  

## Next Steps

1. Change admin password to a strong one
2. Set up Telegram bot (optional)
3. Configure API endpoints in admin panel
4. Deploy to production
5. Set up SSL/HTTPS

## Key Files

| File | Purpose |
|------|---------|
| `/app/page.tsx` | Homepage |
| `/app/login/page.tsx` | Login page |
| `/app/register/page.tsx` | Registration page |
| `/app/dashboard/page.tsx` | User dashboard |
| `/app/pricing/page.tsx` | Pricing page |
| `/app/x7f3k9m2q1w0r4t8y5u6i7o8p9a0s1d2f3g4h5j6k7l8z9x0c1v2b3n4m5q6w7e8r9t0y1/page.tsx` | Admin panel |
| `/app/api/auth/login/route.ts` | Login API |
| `/app/api/auth/register/route.ts` | Registration API |
| `/app/api/search/route.ts` | Search API |
| `/app/api/admin/verify/route.ts` | Admin authentication |
| `/app/api/telegram/webhook/route.ts` | Telegram bot |
| `/scripts/init-db.sql` | Database schema |
| `/lib/auth.ts` | Authentication utilities |

## Admin Features

After logging in to admin panel:

1. **View Dashboard Stats**
   - Total users
   - Total searches
   - Suspicious activities

2. **Manage APIs**
   - Add new API (breach.rip, etc.)
   - Configure rate limits
   - Set API keys
   - Delete APIs

3. **Monitor Activity** (coming soon)
   - User activity logs
   - IP tracking
   - Behavioral analysis

## User Workflow

1. Register account
2. Get free daily search (1 per day)
3. View telegram code in dashboard
4. Connect Telegram bot with code
5. Use `/search` command in Telegram or web dashboard
6. Upgrade plan for more searches

## Common Issues

**Issue**: "Supabase connection failed"
- Solution: Check NEXT_PUBLIC_SUPABASE_URL and key in .env.local

**Issue**: Admin login not working
- Solution: Verify ADMIN_PASSWORD in .env.local

**Issue**: Telegram bot not responding
- Solution: Run setup script and verify webhook URL

**Issue**: Search returns no results
- Solution: Add API configuration in admin panel

## Production Checklist

- [ ] Change ADMIN_PASSWORD
- [ ] Update ADMIN_SECRET to random string
- [ ] Set TELEGRAM_BOT_TOKEN
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up database backups
- [ ] Enable rate limiting
- [ ] Review security policies
- [ ] Set up monitoring
- [ ] Configure email notifications

## Support Resources

- Full documentation: `/OSINT_PLATFORM_GUIDE.md`
- Supabase docs: https://supabase.com/docs
- Next.js docs: https://nextjs.org/docs
- Telegram Bot API: https://core.telegram.org/bots/api

---

**Ready?** Run `npm run dev` and visit http://localhost:3000!
