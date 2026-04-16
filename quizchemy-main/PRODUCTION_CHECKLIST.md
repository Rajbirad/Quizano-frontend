# Production Readiness Checklist

Use this checklist before deploying to production to ensure everything is properly configured.

## Pre-Deployment Checklist

### Environment & Configuration
- [ ] `.env.production` file created with all required variables
- [ ] All API endpoints point to production URLs
- [ ] Supabase production project configured
- [ ] CORS origins updated in `supabase/functions/_shared/cors.ts`
- [ ] SSL certificates obtained and configured
- [ ] Domain DNS configured correctly

### Security
- [ ] All secrets moved to environment variables (no hardcoded values)
- [ ] Content Security Policy (CSP) configured
- [ ] Security headers configured (nginx/vercel/netlify)
- [ ] Rate limiting enabled on API endpoints
- [ ] HTTPS enforced (HTTP redirects to HTTPS)
- [ ] CORS properly configured (not using wildcard in production)
- [ ] Authentication tokens properly secured
- [ ] Row Level Security (RLS) enabled on all Supabase tables
- [ ] SQL injection protection verified
- [ ] XSS protection enabled
- [ ] CSRF protection implemented
- [ ] Input validation on all forms
- [ ] File upload validation (size, type, content)
- [ ] API keys rotated from development values

### Performance
- [ ] Code splitting implemented
- [ ] Lazy loading for routes
- [ ] Images optimized (WebP, compressed)
- [ ] Fonts optimized (subset, preload)
- [ ] Bundle size < 500KB per chunk
- [ ] Initial load time < 3 seconds
- [ ] Database queries optimized with indexes
- [ ] Connection pooling enabled
- [ ] Caching strategy implemented
- [ ] CDN configured for static assets
- [ ] Gzip/Brotli compression enabled
- [ ] Service Worker for offline support (optional)

### Database
- [ ] Production database created
- [ ] All migrations run successfully
- [ ] Database indexes created
- [ ] Row Level Security policies created
- [ ] Database backups configured
- [ ] Connection pooling enabled
- [ ] Query performance tested
- [ ] Database credentials secured

### Monitoring & Logging
- [ ] Error tracking service configured (Sentry/Rollbar)
- [ ] Analytics configured (Google Analytics/Mixpanel)
- [ ] Performance monitoring enabled (Lighthouse CI)
- [ ] Uptime monitoring configured (UptimeRobot/Pingdom)
- [ ] Log aggregation service configured
- [ ] Alert rules configured
- [ ] Status page created
- [ ] Health check endpoint implemented

### Testing
- [ ] All critical user flows tested
- [ ] Authentication flow tested
- [ ] Payment flow tested (if applicable)
- [ ] Cross-browser testing completed (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsiveness verified (iOS, Android)
- [ ] Load testing completed (1000+ concurrent users)
- [ ] Stress testing completed
- [ ] Security testing completed (OWASP Top 10)
- [ ] Accessibility testing completed (WCAG 2.1 AA)

### API & Backend
- [ ] API rate limiting configured
- [ ] API authentication working
- [ ] API error handling implemented
- [ ] API timeout handling configured
- [ ] API retry logic implemented
- [ ] WebSocket connections stable (if applicable)
- [ ] Background jobs configured (if applicable)
- [ ] Cron jobs configured (if applicable)

### Content & Assets
- [ ] All placeholder content replaced
- [ ] All images have alt text
- [ ] Favicon configured
- [ ] Open Graph tags configured
- [ ] Twitter Card tags configured
- [ ] robots.txt configured
- [ ] sitemap.xml generated
- [ ] 404 page created
- [ ] Error pages created (500, 503)

### Documentation
- [ ] README.md updated
- [ ] API documentation complete
- [ ] Deployment documentation complete
- [ ] Runbook created for common issues
- [ ] Emergency contacts documented
- [ ] Rollback procedure documented

### Legal & Compliance
- [ ] Privacy Policy published
- [ ] Terms of Service published
- [ ] Cookie consent implemented (if EU traffic)
- [ ] GDPR compliance verified (if EU traffic)
- [ ] CCPA compliance verified (if CA traffic)
- [ ] Data retention policy implemented
- [ ] User data export functionality (if required)
- [ ] User data deletion functionality (if required)

### Build & Deployment
- [ ] Production build tested locally
- [ ] Bundle analysis completed
- [ ] No console.logs in production build
- [ ] Source maps configured (uploaded to error tracking)
- [ ] CI/CD pipeline configured
- [ ] Staging environment deployed and tested
- [ ] Blue-green deployment strategy (or similar) in place
- [ ] Rollback procedure tested
- [ ] Database migration strategy defined
- [ ] Zero-downtime deployment verified

### Post-Deployment
- [ ] Smoke tests run on production
- [ ] Health check passing
- [ ] Monitoring dashboards showing green
- [ ] No critical errors in logs
- [ ] Performance metrics within targets
- [ ] Analytics tracking verified
- [ ] Email notifications working
- [ ] Payment processing working (if applicable)
- [ ] Search engines can crawl site
- [ ] Social media sharing working

### Infrastructure
- [ ] Auto-scaling configured
- [ ] Load balancer configured
- [ ] Database replicas configured (if needed)
- [ ] Redis/cache layer configured
- [ ] Backup strategy tested
- [ ] Disaster recovery plan documented
- [ ] Infrastructure as Code (IaC) implemented
- [ ] Cost monitoring configured
- [ ] Resource limits configured

### Team Readiness
- [ ] Team trained on deployment process
- [ ] On-call rotation scheduled
- [ ] Incident response plan documented
- [ ] Communication channels established
- [ ] Monitoring alerts configured for team
- [ ] Documentation accessible to team

## Performance Targets

- **First Contentful Paint (FCP):** < 1.8s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Time to Interactive (TTI):** < 3.8s
- **Total Blocking Time (TBT):** < 200ms
- **Cumulative Layout Shift (CLS):** < 0.1
- **First Input Delay (FID):** < 100ms

## Lighthouse Scores

All scores should be > 90:
- **Performance:** > 90
- **Accessibility:** > 90
- **Best Practices:** > 90
- **SEO:** > 90

## Load Testing Targets

- **Concurrent Users:** 1000+
- **Response Time (p95):** < 500ms
- **Error Rate:** < 0.1%
- **Uptime:** > 99.9%

## Security Scan

- [ ] OWASP ZAP scan completed
- [ ] npm audit shows no high/critical vulnerabilities
- [ ] Snyk scan completed
- [ ] SSL Labs grade A+
- [ ] Security headers verified

## Final Sign-Off

- [ ] Product Owner approved
- [ ] Tech Lead approved
- [ ] DevOps approved
- [ ] Security Team approved
- [ ] Legal approved (if required)

---

**Deployment Date:** _________________
**Deployed By:** _________________
**Version:** _________________
**Rollback Plan:** _________________
