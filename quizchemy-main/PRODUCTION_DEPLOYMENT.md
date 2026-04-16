# Production Deployment Guide

This guide covers deploying Quizchemy to production for handling thousands of concurrent users.

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Build Optimization](#build-optimization)
4. [Deployment](#deployment)
5. [Monitoring](#monitoring)
6. [Performance](#performance)
7. [Security](#security)
8. [Scaling](#scaling)

## Pre-Deployment Checklist

### Required Changes

- [ ] Update environment variables in `.env.production`
- [ ] Configure proper CORS origins in `supabase/functions/_shared/cors.ts`
- [ ] Set up error monitoring service (Sentry, LogRocket, etc.)
- [ ] Configure CDN for static assets
- [ ] Set up database connection pooling
- [ ] Enable rate limiting on API endpoints
- [ ] Configure SSL certificates
- [ ] Set up automated backups
- [ ] Configure CI/CD pipeline
- [ ] Set up health check endpoints

### Code Optimizations Applied

✅ Error boundaries for graceful error handling
✅ Production-ready API client with retries and timeouts
✅ Security utilities (XSS prevention, CSRF, rate limiting)
✅ Optimized Supabase client with connection pooling
✅ Structured logging for monitoring
✅ Code splitting and lazy loading
✅ Asset optimization in build config
✅ Console.log removal in production builds

## Environment Setup

### 1. Create `.env.production` file

```bash
# API Configuration
VITE_API_URL=https://api.your-domain.com
VITE_APP_URL=https://your-domain.com

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true

# Environment
NODE_ENV=production
```

### 2. Update CORS Configuration

Edit `supabase/functions/_shared/cors.ts`:

```typescript
const allowedOrigins = [
  'https://your-domain.com',
  'https://www.your-domain.com',
  'https://app.your-domain.com',
];
```

## Build Optimization

### 1. Build for Production

```bash
# Install dependencies
npm install

# Run production build
npm run build:prod

# Test production build locally
npm run preview
```

### 2. Analyze Bundle Size

```bash
# Install analyzer
npm install --save-dev rollup-plugin-visualizer

# Build with analysis
npm run build -- --mode analyze
```

### 3. Verify Build Output

Check `dist/` folder:
- Chunk files should be < 500KB
- Main bundle should be < 200KB
- Assets should be hashed for caching

## Deployment

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**vercel.json configuration:**

```json
{
  "buildCommand": "npm run build:prod",
  "outputDirectory": "dist",
  "framework": "vite",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Option 2: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

**netlify.toml configuration:**

```toml
[build]
  command = "npm run build:prod"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Option 3: AWS S3 + CloudFront

```bash
# Build
npm run build:prod

# Sync to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### Option 4: Docker

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:prod

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Monitoring

### 1. Set Up Error Tracking (Sentry)

```bash
npm install @sentry/react @sentry/tracing
```

**src/main.tsx:**

```typescript
import * as Sentry from "@sentry/react";

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: "YOUR_SENTRY_DSN",
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay(),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}
```

### 2. Set Up Analytics

Integrate Google Analytics, Mixpanel, or Amplitude:

```typescript
// src/utils/analytics.ts
export function trackEvent(event: string, properties?: Record<string, any>) {
  if (import.meta.env.PROD && window.gtag) {
    window.gtag('event', event, properties);
  }
}
```

### 3. Performance Monitoring

Use Web Vitals:

```bash
npm install web-vitals
```

```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // Send to your analytics service
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

## Performance

### Database Optimization

1. **Enable Connection Pooling in Supabase:**
   - Go to Supabase Dashboard → Settings → Database
   - Enable connection pooling (Transaction mode for serverless)

2. **Add Indexes:**
   ```sql
   CREATE INDEX idx_quizzes_user_id ON quizzes_normalized(user_id);
   CREATE INDEX idx_flashcards_user_id ON flashcard_sets_normalized(user_id);
   CREATE INDEX idx_created_at ON quizzes_normalized(created_at DESC);
   ```

3. **Enable Row Level Security:**
   ```sql
   ALTER TABLE quizzes_normalized ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Users can view own quizzes"
     ON quizzes_normalized FOR SELECT
     USING (auth.uid() = user_id);
   ```

### CDN Configuration

1. Use CloudFront or Cloudflare for:
   - Static asset delivery
   - DDoS protection
   - SSL termination
   - Caching

2. Cache-Control headers already configured in build

### Image Optimization

```bash
# Install image optimization tools
npm install --save-dev imagemin imagemin-webp imagemin-mozjpeg
```

## Security

### 1. Content Security Policy

Already configured in `src/utils/security-prod.ts`. Add to HTML:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net;">
```

### 2. Rate Limiting

Implement on API Gateway/Load Balancer:

```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /api/ {
    limit_req zone=api burst=20 nodelay;
}
```

### 3. Security Headers

Already configured in deployment configs above.

### 4. Regular Security Audits

```bash
# Audit npm packages
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update
```

## Scaling

### Horizontal Scaling

1. **Auto-scaling with Kubernetes:**

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: quizchemy-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: quizchemy
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

2. **Load Balancing:**
   - Use AWS ALB, GCP Load Balancer, or nginx
   - Enable health checks
   - Configure session affinity if needed

### Database Scaling

1. **Read Replicas:**
   - Use Supabase read replicas for read-heavy operations
   - Direct writes to primary, reads to replicas

2. **Caching Layer:**
   ```typescript
   // Use Redis for caching
   import { Redis } from '@upstash/redis'
   
   const redis = new Redis({
     url: process.env.REDIS_URL,
     token: process.env.REDIS_TOKEN,
   })
   ```

3. **Query Optimization:**
   - Use the provided `executeCachedQuery` function
   - Implement pagination for all list queries
   - Use `select` to fetch only needed fields

### Monitoring Metrics

Track these metrics:

- **Response Time:** < 200ms for API calls
- **Error Rate:** < 0.1%
- **Uptime:** > 99.9%
- **Concurrent Users:** Monitor with APM tools
- **Database Connections:** Keep below pool limit
- **Memory Usage:** < 80% of available
- **CPU Usage:** < 70% average

## Health Checks

Create a health check endpoint:

```typescript
// Supabase Edge Function: health-check
import { serve } from 'https://deno.fresh.dev/server/serve.ts';

serve(async () => {
  try {
    // Check database connection
    // Check external services
    
    return new Response(
      JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ status: 'unhealthy', error: error.message }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

## Backup Strategy

1. **Database Backups:**
   - Supabase automatically backs up daily
   - Enable point-in-time recovery
   - Test restore procedures monthly

2. **Code Backups:**
   - Use Git with protected main branch
   - Tag releases: `git tag -a v1.0.0 -m "Release 1.0.0"`

3. **Asset Backups:**
   - S3 versioning enabled
   - Cross-region replication for critical assets

## Post-Deployment

1. **Smoke Tests:**
   - Test all critical user flows
   - Verify authentication works
   - Check all API endpoints

2. **Performance Tests:**
   - Run load tests with tools like k6 or Artillery
   - Target: 1000+ concurrent users

3. **Monitor for 24 hours:**
   - Watch error rates
   - Check server resources
   - Review user feedback

## Rollback Plan

If issues occur:

```bash
# Vercel
vercel rollback

# Netlify
netlify rollback

# Manual
git revert HEAD
npm run build:prod
# Deploy previous version
```

## Support

- Documentation: [Your docs URL]
- Status Page: [Your status page URL]
- Support Email: support@your-domain.com

## Troubleshooting

### High Memory Usage
- Enable production mode (disables source maps)
- Check for memory leaks with Chrome DevTools
- Review large bundle sizes

### Slow API Responses
- Check database query performance
- Verify connection pooling is enabled
- Review API rate limits

### CORS Errors
- Verify allowed origins in cors.ts
- Check API Gateway CORS settings
- Verify credentials mode

---

**Last Updated:** January 2026
**Version:** 1.0.0
