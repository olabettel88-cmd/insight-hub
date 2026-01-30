# OSINT Platform - Enterprise Intelligence Gathering System

> A comprehensive, secure, and feature-rich OSINT platform with advanced logging, hidden admin controls, Telegram integration, and military-grade security.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (copy .env.example to .env.local)
cp .env.example .env.local
# Edit with your values

# 3. Run database migration
# Execute scripts/init-db.sql in Supabase SQL editor

# 4. Start development server
npm run dev

# 5. Open http://localhost:3000
```

## 📋 Documentation

| Document | Purpose |
|----------|---------|
| [SETUP_QUICK_START.md](./SETUP_QUICK_START.md) | 5-minute setup guide |
| [OSINT_PLATFORM_GUIDE.md](./OSINT_PLATFORM_GUIDE.md) | Complete documentation |
| [SYSTEM_OVERVIEW.md](./SYSTEM_OVERVIEW.md) | Technical architecture |
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | Production deployment |

## ✨ Key Features

### 🔐 Security & Authentication
- ✅ Secure user registration & login
- ✅ Password hashing with SHA-256
- ✅ Rate limiting (5 login attempts/15 mins)
- ✅ Token-based authentication
- ✅ API key management
- ✅ Hidden admin routes (obscured paths)
- ✅ Comprehensive audit logs
- ✅ IP address tracking & threat detection

### 🔍 OSINT Search Engine
- ✅ Multi-source intelligence search
- ✅ Search types: email, domain, username, phone
- ✅ Real-time results
- ✅ Search history tracking
- ✅ Daily search limits per plan
- ✅ API endpoint flexibility
- ✅ Request quota monitoring
- ✅ Response time tracking

### 📊 Advanced Logging System
- ✅ Every activity logged with IP + user agent
- ✅ IP geolocation & VPN detection
- ✅ Behavioral analysis
- ✅ Suspicious activity detection
- ✅ Search pattern analysis
- ✅ Response time monitoring
- ✅ Admin action audit trails
- ✅ 90-day log retention

### 🤖 Telegram Bot Integration
- ✅ Account linking with unique codes
- ✅ Direct search from Telegram
- ✅ Account status checking
- ✅ Help & command documentation
- ✅ User-friendly responses
- ✅ Real-time search results

### 💳 Flexible Pricing
- **Free**: 1 search/day
- **Monthly**: $20 - 30 searches
- **Quarterly**: $50 - 100 searches
- **Yearly**: $100 - 500 searches
- **Lifetime**: $300 - Unlimited

### 🎨 Professional Design
- ✅ Red-focused dark theme
- ✅ Glass morphism UI
- ✅ Responsive design (mobile-friendly)
- ✅ Smooth animations
- ✅ Professional aesthetics
- ✅ Accessible components

### 👨‍💼 Admin Dashboard
- ✅ Hidden route with password protection
- ✅ API endpoint management
- ✅ User statistics
- ✅ Activity monitoring
- ✅ User suspension/banning
- ✅ Search quota management
- ✅ Admin audit logs

## 🏗️ Architecture

### Frontend (Next.js 16)
- Server Components for data fetching
- Client Components for interactivity
- Optimized images and assets
- Dark mode support
- Mobile-responsive layouts

### Backend (API Routes)
- Rate limiting & security
- Token validation
- Data logging & tracking
- Error handling
- Request optimization

### Database (Supabase PostgreSQL)
- 10 optimized tables
- Row-Level Security (RLS)
- Comprehensive indexing
- Audit trails
- Real-time subscriptions ready

### Security
- Rate limiting on auth
- Input validation
- SQL injection prevention
- XSS protection
- CSRF tokens ready
- Admin-only routes
- Encrypted API keys

## 📁 Project Structure

```
├── app/
│   ├── page.tsx                              # Homepage
│   ├── login/page.tsx                        # Login page
│   ├── register/page.tsx                     # Registration
│   ├── dashboard/page.tsx                    # User dashboard
│   ├── pricing/page.tsx                      # Pricing page
│   ├── x7f3k9m2q1w0r4t8y5u6i7o8p9a0s1d2f3g4h5j6k7l8z9x0c1v2b3n4m5q6w7e8r9t0y1/
│   │   └── page.tsx                          # Hidden admin panel
│   ├── api/
│   │   ├── auth/login/route.ts              # Login API
│   │   ├── auth/register/route.ts           # Registration API
│   │   ├── users/[id]/route.ts              # User profile API
│   │   ├── search/route.ts                  # Search API
│   │   ├── admin/verify/route.ts            # Admin authentication
│   │   ├── admin/stats/route.ts             # Admin stats
│   │   ├── admin/api-config/route.ts        # API management
│   │   └── telegram/webhook/route.ts        # Telegram bot
│   ├── globals.css                          # Red theme styles
│   └── layout.tsx                           # Root layout
├── lib/
│   └── auth.ts                              # Auth utilities
├── scripts/
│   ├── init-db.sql                          # Database schema
│   └── telegram-bot-setup.js                # Bot setup
├── .env.example                             # Environment template
└── README.md                                # This file
```

## 🔧 Configuration

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
ADMIN_PASSWORD=your_strong_password
ADMIN_SECRET=your_secret_key
TELEGRAM_BOT_TOKEN=your_bot_token
```

### Supabase Setup
1. Create new project
2. Run database migration
3. Configure auth policies
4. Enable API access

### Telegram Bot Setup
```bash
node scripts/telegram-bot-setup.js "BOT_TOKEN" "WEBHOOK_URL"
```

## 🚢 Deployment

### Vercel (Recommended)
```bash
git push origin main
# Auto-deploys from GitHub
```

### Self-Hosted
```bash
npm run build
npm start
```

### Docker
```bash
docker build -t osint .
docker run -p 3000:3000 osint
```

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

## 📊 API Endpoints

### Authentication
```
POST /api/auth/login
POST /api/auth/register
```

### User
```
GET /api/users/[id]
POST /api/search
```

### Admin (Password Protected)
```
POST /api/admin/verify
GET /api/admin/stats
POST /api/admin/api-config
DELETE /api/admin/api-config/[id]
```

### Telegram
```
POST /api/telegram/webhook
```

## 🔒 Security Features

- ✅ Rate limiting (5 login attempts/15 min)
- ✅ IP address detection & logging
- ✅ Password hashing
- ✅ Token validation
- ✅ Admin audit trails
- ✅ User banning system
- ✅ Hidden admin routes
- ✅ API key encryption
- ✅ RLS policies
- ✅ Suspicious activity detection
- ✅ Request quota enforcement
- ✅ Activity monitoring

## 📈 Database Schema

### Core Tables
- **users** - User accounts
- **admins** - Admin users
- **activity_logs** - All activities
- **search_history** - Search records
- **api_config** - API endpoints

### Monitoring Tables
- **ip_intelligence** - IP tracking
- **suspicious_activity** - Flagged activities
- **request_quota** - Usage limits
- **admin_audit_logs** - Admin actions
- **payment_history** - Transactions

## 🎨 Design System

### Colors
- **Primary**: #dc2626 (Red)
- **Accent**: #ef4444 (Light Red)
- **Background**: #0a0a0a (Dark)
- **Text**: #fafafa (Off-white)
- **Muted**: #3f3f3f (Gray)

### Typography
- **Headlines**: Geist Bold
- **Body**: Geist Regular
- **Code**: Geist Mono

## 🧪 Testing

### Manual Testing
1. Create account
2. Perform searches
3. Check dashboard
4. View telegram code
5. Test admin login
6. Review activity logs

### Login Admin Dashboard
- Route: Hidden (see docs)
- Password: Check .env.local
- Default user: None (setup yourself)

## 📱 Features Ready to Use

### Fully Implemented
- User authentication
- Dashboard & search
- Admin panel
- Logging system
- Telegram bot
- Pricing page
- Dark theme
- API management

### Ready for Enhancement
- Payment processing
- Email notifications
- Advanced analytics
- User suspension
- Custom reports

## 🐛 Troubleshooting

**Can't login?**
- Check username/password
- Review activity logs
- Verify user exists

**Search not working?**
- Add API in admin panel
- Check rate limits
- Verify search quota

**Admin panel won't load?**
- Check admin password
- Verify database connection
- Review error logs

**Telegram bot not responding?**
- Run bot setup script
- Verify webhook URL
- Check bot token

See [OSINT_PLATFORM_GUIDE.md](./OSINT_PLATFORM_GUIDE.md) for detailed troubleshooting.

## 📞 Support

- Documentation: [OSINT_PLATFORM_GUIDE.md](./OSINT_PLATFORM_GUIDE.md)
- Quick Start: [SETUP_QUICK_START.md](./SETUP_QUICK_START.md)
- Deployment: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- System: [SYSTEM_OVERVIEW.md](./SYSTEM_OVERVIEW.md)

## 📄 License

This OSINT Platform is provided for authorized intelligence gathering and security research purposes only. Users are responsible for ensuring compliance with all applicable laws and regulations.

## ⚖️ Disclaimer

This platform should only be used for lawful purposes. The operator is responsible for:
- Complying with all local laws and regulations
- Obtaining proper authorization
- Protecting user data
- Maintaining system security
- Creating incident response procedures

## 🚀 Getting Started Checklist

- [ ] Copy .env.example to .env.local
- [ ] Fill in environment variables
- [ ] Run database migration
- [ ] Test locally with `npm run dev`
- [ ] Setup Telegram bot (optional)
- [ ] Deploy to production
- [ ] Configure custom domain
- [ ] Enable SSL/HTTPS
- [ ] Monitor dashboards
- [ ] Review security logs

---

## Next Steps

1. **Read** [SETUP_QUICK_START.md](./SETUP_QUICK_START.md) for 5-minute setup
2. **Deploy** to your chosen platform
3. **Configure** your API endpoints
4. **Test** all features
5. **Monitor** activity dashboards
6. **Iterate** with custom enhancements

---

**Built with Next.js 16, React 19, Supabase, and Tailwind CSS**

**Status**: ✅ Production-Ready

**Last Updated**: 2024-01-24
