# 🚀 Quick Start Guide - Production Deployment

## Prerequisites
- Node.js 18+
- npm or yarn
- Production environment variables
- Domain name configured

## 5-Minute Deploy to Vercel

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Create .env.production
cp .env.production.example .env.production
# Edit .env.production with your values

# 3. Build and test locally
npm ci
npm run build:prod
npm run preview:prod

# 4. Deploy to production
vercel --prod
```

## 5-Minute Deploy to Netlify

```bash
# 1. Install Netlify CLI
npm i -g netlify-cli

# 2. Create .env.production
cp .env.production.example .env.production
# Edit .env.production with your values

# 3. Build and test locally
npm ci
npm run build:prod
npm run preview:prod

# 4. Deploy to production
netlify deploy --prod
```

## Environment Variables (Required)

```bash
VITE_API_URL=https://api.your-domain.com
VITE_APP_URL=https://your-domain.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Update CORS (Required)

Edit `supabase/functions/_shared/cors.ts`:

```typescript
const allowedOrigins = [
  'https://your-domain.com',
  'https://www.your-domain.com',
];
```

## Database Indexes (Recommended)

Run in Supabase SQL Editor:

```sql
-- Improve query performance
CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON quizzes_normalized(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_user_id ON flashcard_sets_normalized(user_id);
CREATE INDEX IF NOT EXISTS idx_created_at ON quizzes_normalized(created_at DESC);
```

## Health Check

After deployment, verify:

```bash
# Check if site is up
curl https://your-domain.com/

# Check health endpoint
curl https://your-domain.com/health
```

## Monitor Performance

1. **Lighthouse Score:**
```bash
npx lighthouse https://your-domain.com --view
```

2. **Load Test:**
```bash
# Install k6
brew install k6  # macOS
choco install k6  # Windows

# Run load test (test with 100 users)
k6 run --vus 100 --duration 60s load-test.js
```

## Rollback (If Needed)

### Vercel:
```bash
vercel rollback
```

### Netlify:
```bash
netlify rollback
```

## Essential Monitoring

Set up (choose at least one):

1. **Error Tracking:**
   - Sentry (recommended)
   - LogRocket
   - Rollbar

2. **Uptime Monitoring:**
   - UptimeRobot (free)
   - Pingdom
   - StatusCake

3. **Analytics:**
   - Google Analytics
   - Plausible
   - Mixpanel

## Performance Targets

✅ First Contentful Paint < 1.8s
✅ Largest Contentful Paint < 2.5s
✅ Cumulative Layout Shift < 0.1
✅ Time to Interactive < 3.8s
✅ Lighthouse Performance > 90

## Quick Troubleshooting

**Site not loading?**
- Check DNS settings
- Verify SSL certificate
- Check deployment logs

**CORS errors?**
- Update allowed origins in cors.ts
- Redeploy Supabase functions

**Slow performance?**
- Check bundle size: `npm run build:analyze`
- Enable database indexes
- Configure CDN

**High error rate?**
- Check error tracking dashboard
- Review application logs
- Verify API endpoints

## Support

📖 Full Documentation: See PRODUCTION_DEPLOYMENT.md
✅ Pre-Launch Checklist: See PRODUCTION_CHECKLIST.md
📊 Implementation Summary: See PRODUCTION_READY_SUMMARY.md

---

**Need help?** Review the comprehensive guides or contact your development team.
