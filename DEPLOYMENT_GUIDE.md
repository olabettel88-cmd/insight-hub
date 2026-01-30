# OSINT Platform - Deployment Guide

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations executed
- [ ] Telegram bot token obtained
- [ ] Admin password changed
- [ ] SSL certificate ready
- [ ] Domain configured
- [ ] Backups configured
- [ ] Monitoring setup
- [ ] Security audit completed

## Deployment to Vercel (Recommended)

### Step 1: Connect Repository
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel auto-detects Next.js project

### Step 2: Environment Variables
In Vercel dashboard, add environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ADMIN_PASSWORD=your_strong_password
ADMIN_SECRET=your_secret_key
TELEGRAM_BOT_TOKEN=your_bot_token
```

### Step 3: Deploy
```bash
git push origin main
# Vercel automatically deploys on push
```

### Step 4: Update Telegram Webhook
After deployment, run:
```bash
node scripts/telegram-bot-setup.js "BOT_TOKEN" "https://yourdomain.vercel.app/api/telegram/webhook"
```

## Self-Hosted Deployment (Node.js)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Build
```bash
npm run build
```

### Step 3: Create .env File
```bash
cp .env.example .env.local
# Edit with production values
```

### Step 4: Start Server
```bash
npm start
# Or for development
npm run dev
```

Access at `http://localhost:3000` (or configured port)

## Docker Deployment

### Step 1: Create Dockerfile
Already included in project root

### Step 2: Build Image
```bash
docker build -t osint-platform:latest .
```

### Step 3: Run Container
```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
  -e ADMIN_PASSWORD=your_password \
  -e TELEGRAM_BOT_TOKEN=your_token \
  osint-platform:latest
```

### Step 4: Docker Compose (Optional)
Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_SUPABASE_URL: ${SUPABASE_URL}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${SUPABASE_KEY}
      ADMIN_PASSWORD: ${ADMIN_PASSWORD}
      TELEGRAM_BOT_TOKEN: ${TELEGRAM_TOKEN}
    restart: unless-stopped
```

Run with:
```bash
docker-compose up -d
```

## AWS Deployment

### Option 1: Amplify (Easiest)
1. Connect GitHub to AWS Amplify
2. Set environment variables
3. Deploy automatically

### Option 2: EC2 + Node.js
1. Launch EC2 instance (t3.small or larger)
2. Install Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

3. Clone repository
4. Install PM2 for process management:
```bash
npm install -g pm2
```

5. Start app:
```bash
pm2 start npm --name "osint" -- start
pm2 startup
pm2 save
```

6. Setup Nginx reverse proxy
7. Configure SSL with Let's Encrypt

### Option 3: ECS with Docker
1. Create ECR repository
2. Push Docker image
3. Create ECS task definition
4. Deploy to ECS cluster

## DigitalOcean App Platform

1. Connect GitHub repository
2. Create app
3. Configure environment variables
4. Deploy automatically
5. Configure custom domain
6. Enable HTTPS

## Production Configuration

### Nginx Setup (for self-hosted)
```nginx
upstream osint_app {
    server localhost:3000;
}

server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://osint_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL/HTTPS Setup (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### PostgreSQL Backup (for self-hosted)
```bash
# Backup
pg_dump -h localhost -U postgres osint_db > backup.sql

# Restore
psql -h localhost -U postgres osint_db < backup.sql
```

## Monitoring & Logging

### Application Monitoring
```bash
# PM2 monitoring
pm2 monit

# Or use
npm install -g pm2-monitoring
pm2-monitoring install
```

### Log Aggregation
```bash
# View logs
pm2 logs osint

# Or setup with ELK stack
npm install winston
```

### Error Tracking
Setup Sentry:
```bash
npm install @sentry/nextjs
```

Add to layout.tsx:
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
});
```

## Performance Optimization

### Enable Caching
```bash
# In next.config.mjs
export default {
  headers: async () => [
    {
      source: '/api/(.*)',
      headers: [
        { key: 'Cache-Control', value: 'private, max-age=0' }
      ]
    }
  ]
}
```

### Enable Compression
Already included in Next.js

### Database Optimization
```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM activity_logs WHERE user_id = '...';

-- Vacuum and analyze
VACUUM ANALYZE;
```

## Database Migration (Production)

### Backup First
```bash
supabase db pull --local
```

### Apply Migration
```bash
supabase db push
# Or manually in Supabase dashboard
```

### Verify
Check data integrity in admin dashboard

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (Vercel handles this)
- Database connection pooling
- Redis for caching
- Session store in database

### Vertical Scaling
- Upgrade server specs
- Increase database resources
- Optimize database indexes
- Enable query caching

### Database Scaling
- Read replicas for reporting
- Connection pooling (PgBouncer)
- Archive old logs
- Partition large tables

## Monitoring Checklist

### Daily
- [ ] Check error logs
- [ ] Monitor admin dashboard
- [ ] Review suspicious activities
- [ ] Check search success rate

### Weekly
- [ ] Review user activity trends
- [ ] Check API performance
- [ ] Monitor storage usage
- [ ] Review security logs

### Monthly
- [ ] Full security audit
- [ ] Database optimization
- [ ] Performance analysis
- [ ] Backup verification
- [ ] Cost review

## Rollback Procedure

If something goes wrong:

### Vercel
```bash
# Rollback to previous deployment
# In Vercel dashboard: Deployments > ... > Rollback
```

### Self-hosted
```bash
# Kill current process
pm2 delete osint

# Rollback code
git revert HEAD
npm run build

# Restart
pm2 start npm --name "osint" -- start
```

## Health Check Endpoint

Create `/api/health`:
```typescript
export async function GET() {
  return Response.json({ 
    status: 'ok',
    timestamp: new Date(),
    version: '1.0.0'
  });
}
```

Monitor with:
```bash
# Cron job every 5 minutes
*/5 * * * * curl https://yourdomain.com/api/health
```

## Disaster Recovery

### Data Backup
- Daily automated backups
- Offsite backup storage
- Monthly full backup verification
- Recovery time: < 1 hour

### Failover Setup
- DNS failover configured
- Hot standby server ready
- Database replication enabled
- Asset CDN active

### Incident Response
1. Identify issue
2. Check logs and dashboards
3. Execute rollback if needed
4. Notify users
5. Post-incident review

## Security Hardening

### Before Going Live
- [ ] Change all default passwords
- [ ] Enable WAF (Web Application Firewall)
- [ ] Setup DDOS protection
- [ ] Enable database encryption
- [ ] Configure VPC security groups
- [ ] Setup API rate limiting
- [ ] Enable CORS protection
- [ ] Setup CSRF tokens
- [ ] Enable security headers

### Post-Deployment
- [ ] Run security audit
- [ ] Penetration testing
- [ ] Code review
- [ ] Dependency scanning
- [ ] Log review
- [ ] Access audit

## Maintenance Windows

Schedule maintenance windows:
- Tuesday 2 AM UTC
- 30 minute window
- Notify users 24 hours in advance
- For: database migrations, major updates

## Support & Communication

### Status Page
Setup at [statuspage.io](https://statuspage.io)
- Real-time status updates
- Incident tracking
- Notification subscriptions

### Documentation
Keep updated:
- API documentation
- Deployment steps
- Configuration guide
- Troubleshooting guide

---

**Need Help?** Check `/OSINT_PLATFORM_GUIDE.md` for detailed documentation.

**Ready to Deploy?** Follow the quick start above!
