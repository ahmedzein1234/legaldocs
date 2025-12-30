# Qannoni Production Deployment Guide

This document provides a comprehensive checklist for deploying Qannoni to production.

## Prerequisites

- Node.js 18+ installed
- Cloudflare account with Workers, D1, R2, and KV enabled
- Wrangler CLI installed (`npm install -g wrangler`)
- Domain configured in Cloudflare DNS

## Environment Setup

### 1. Cloudflare Resources

Create the following resources in Cloudflare:

```bash
# Login to Cloudflare
wrangler login

# Create D1 Database
wrangler d1 create qannoni-db-prod

# Create R2 Bucket
wrangler r2 bucket create qannoni-storage-prod

# Create KV Namespace
wrangler kv namespace create CACHE
```

Record the IDs from these commands for your `wrangler.toml`.

### 2. API Environment Variables

Set the following secrets for the API worker:

```bash
cd apps/api

# JWT Secret (generate a secure random string)
wrangler secret put JWT_SECRET

# Resend API Key (for email notifications)
wrangler secret put RESEND_API_KEY

# OpenRouter API Key (for AI features)
wrangler secret put OPENROUTER_API_KEY

# Twilio Credentials (for WhatsApp)
wrangler secret put TWILIO_ACCOUNT_SID
wrangler secret put TWILIO_AUTH_TOKEN
wrangler secret put TWILIO_WHATSAPP_FROM
```

### 3. wrangler.toml Configuration

Update `apps/api/wrangler.toml`:

```toml
name = "qannoni-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[vars]
APP_URL = "https://www.qannoni.com"
ENVIRONMENT = "production"

[[d1_databases]]
binding = "DB"
database_name = "qannoni-db-prod"
database_id = "<your-d1-database-id>"

[[r2_buckets]]
binding = "STORAGE"
bucket_name = "qannoni-storage-prod"

[[kv_namespaces]]
binding = "CACHE"
id = "<your-kv-namespace-id>"
```

### 4. Database Migration

Run the initial migration:

```bash
cd apps/api
wrangler d1 execute qannoni-db-prod --file=./migrations/001_initial.sql
```

### 5. Web App Environment

Create `apps/web/.env.production`:

```env
NEXT_PUBLIC_API_URL=https://api.qannoni.com
NEXT_PUBLIC_APP_URL=https://www.qannoni.com
```

## Deployment Commands

### Deploy API

```bash
cd apps/api
npm run deploy
```

### Deploy Web App

```bash
cd apps/web

# Build the static export
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy out --project-name=qannoni-web
```

## Post-Deployment Verification

### 1. Health Check

```bash
curl https://api.qannoni.com/health
# Expected: {"status":"ok","timestamp":"..."}
```

### 2. Auth Flow Test

```bash
# Test registration endpoint
curl -X POST https://api.qannoni.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123","fullName":"Test User"}'
```

### 3. CORS Verification

```bash
curl -I -X OPTIONS https://api.qannoni.com/api/auth/login \
  -H "Origin: https://www.qannoni.com" \
  -H "Access-Control-Request-Method: POST"
```

Verify the `Access-Control-Allow-Origin` header is present.

## Security Checklist

- [ ] JWT_SECRET is at least 32 characters and randomly generated
- [ ] All API secrets are set via `wrangler secret put`
- [ ] CORS is configured to only allow your domains
- [ ] Rate limiting is enabled (configured in middleware)
- [ ] CSP headers are properly set
- [ ] httpOnly cookies are used for auth tokens
- [ ] HTTPS is enforced on all endpoints

## Feature Configuration

### Email Notifications (Resend)

1. Create account at [resend.com](https://resend.com)
2. Verify your sending domain
3. Create API key
4. Set `RESEND_API_KEY` secret

### WhatsApp Integration (Twilio)

1. Create Twilio account
2. Enable WhatsApp sandbox or business profile
3. Set credentials via secrets:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_WHATSAPP_FROM` (format: `whatsapp:+1234567890`)

### AI Document Generation (OpenRouter)

1. Create account at [openrouter.ai](https://openrouter.ai)
2. Add credits
3. Create API key
4. Set `OPENROUTER_API_KEY` secret

## Monitoring

### Cloudflare Analytics

Access via Cloudflare Dashboard:
- Workers Analytics: Request metrics, error rates
- D1 Analytics: Query performance
- R2 Analytics: Storage usage

### Sentry Integration

The API is configured with Sentry. To enable:

1. Create project at [sentry.io](https://sentry.io)
2. Get DSN
3. Update `src/lib/sentry.ts` with your DSN

### Log Tailing

```bash
cd apps/api
wrangler tail
```

## Backup Strategy

### Database Backup

```bash
# Export D1 database
wrangler d1 export qannoni-db-prod --output=backup.sql
```

### R2 Data

Configure lifecycle rules in Cloudflare dashboard for:
- Document retention policies
- Automatic cleanup of temporary files

## Rollback Procedure

### API Rollback

```bash
# List deployments
wrangler deployments list

# Rollback to previous version
wrangler rollback
```

### Web Rollback

Via Cloudflare Pages dashboard:
1. Go to Deployments
2. Select previous deployment
3. Click "Rollback to this deployment"

## DNS Configuration

Configure the following DNS records:

| Type | Name | Content |
|------|------|---------|
| CNAME | api | `qannoni-api.<account>.workers.dev` |
| CNAME | www | `qannoni-web.pages.dev` |
| A/CNAME | @ | Points to www or Pages |

Enable Cloudflare Proxy (orange cloud) for all records.

## Troubleshooting

### Common Issues

**1. CORS Errors**
- Verify `APP_URL` environment variable
- Check allowed origins in CORS middleware

**2. Database Connection**
- Verify D1 database ID in wrangler.toml
- Run migration if tables don't exist

**3. Auth Token Issues**
- Check JWT_SECRET is set
- Verify cookie domain settings
- Ensure `credentials: 'include'` in frontend requests

**4. File Upload Failures**
- Check R2 bucket binding
- Verify bucket exists and is correctly named

### Getting Help

- Check Cloudflare Workers documentation
- Review logs via `wrangler tail`
- Contact support with deployment ID

## Maintenance Tasks

### Weekly
- Review error logs
- Check storage usage
- Monitor API latency

### Monthly
- Database backup verification
- Security audit
- Update dependencies

### Quarterly
- Load testing
- Security penetration testing
- Disaster recovery drill
