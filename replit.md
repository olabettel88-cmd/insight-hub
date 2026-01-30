# PKA291 OSINT_ARCH Platform

## Overview
A comprehensive Next.js 16 OSINT (Open Source Intelligence) platform with advanced security features, cryptocurrency payments, and multi-account detection capabilities.

## Tech Stack
- **Framework**: Next.js 16.0.10 with React 19
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI primitives with shadcn/ui
- **Database**: Supabase (PostgreSQL with RLS policies)
- **Authentication**: JWT-based with session management
- **Payments**: Heleket cryptocurrency gateway
- **Package Manager**: pnpm

## Project Structure
```
app/                    # Next.js App Router pages
  api/                  # API routes
    admin/              # Admin API endpoints (users, activity, suspicious, multi-accounts)
    auth/               # Authentication (login, register, logout)
    payment/            # Heleket payment integration (create, webhook, status)
    search/             # Search API
    users/              # User management
  dashboard/            # User dashboard
  docs/                 # Documentation page
  login/                # Login page
  register/             # Registration page
  pricing/              # Pricing with crypto payments
  x7f3k9m2q1...         # Admin dashboard (obfuscated URL)
components/             # React components
  ui/                   # shadcn/ui components
lib/                    # Core utilities
  auth.ts               # Authentication utilities
  badges.ts             # User badge system
  cookies.ts            # Cookie management
  fingerprint.ts        # Device fingerprinting & threat detection
  heleket.ts            # Heleket payment integration
  jwt.ts                # JWT token handling
  obfuscate.ts          # API endpoint obfuscation
  database-schema.sql   # Complete database schema with RLS
public/                 # Static assets
styles/                 # Global styles
```

## Key Features

### Security
- Row Level Security (RLS) policies for all database tables
- Device fingerprinting for multi-account detection
- IP intelligence and threat analysis
- Session management with cookie-based authentication
- API endpoint obfuscation

### Payments
- Heleket cryptocurrency payment gateway integration
- Supports BTC, ETH, USDT, LTC, USDC
- Automatic subscription activation on payment confirmation
- Webhook handling for payment status updates

### Admin Dashboard
- Comprehensive user management
- Activity log monitoring
- Suspicious activity detection and resolution
- Multi-account link detection and action
- API configuration management

### User Badges
- Newcomer, Verified, Subscriber, Power User, Veteran, Elite
- Referrer badges for referral achievements
- Trusted badge for low-risk users

### Referral System
- 10% commission on referred user payments
- Automatic tracking and reward calculation
- Multi-account detection to prevent abuse

## Development
```bash
pnpm dev --hostname 0.0.0.0 --port 5000
```

## Environment Variables
Required secrets (set in Replit Secrets):
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `JWT_SECRET` - Secret for JWT signing
- `ADMIN_PASSWORD` - Admin panel password
- `HELEKET_MERCHANT_ID` - Heleket merchant ID
- `HELEKET_API_KEY` - Heleket API key

## Database Setup
1. Go to Supabase SQL Editor
2. Run the contents of `lib/database-schema.sql`
3. This creates all tables with proper RLS policies

## Deployment
Configured for autoscale deployment with Next.js production server.
```bash
pnpm build && pnpm start -p 5000
```
