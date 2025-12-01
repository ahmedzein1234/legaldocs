# LegalDocs - Cloudflare Deployment Guide

## Prerequisites

1. [Cloudflare account](https://dash.cloudflare.com/sign-up)
2. [Node.js 18+](https://nodejs.org/)
3. [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

```bash
npm install -g wrangler
wrangler login
```

## Step 1: Create Cloudflare Resources

### Create D1 Database
```bash
cd apps/api
wrangler d1 create legaldocs-db
```

Copy the `database_id` from the output and update `apps/api/wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "legaldocs-db"
database_id = "YOUR_DATABASE_ID_HERE"
```

### Initialize Database Schema
```bash
wrangler d1 execute legaldocs-db --file=./schema.sql
```

### Create R2 Bucket (for file storage)
```bash
wrangler r2 bucket create legaldocs-storage
```

### Create KV Namespace (for caching)
```bash
wrangler kv:namespace create CACHE
```

Copy the `id` from the output and update `apps/api/wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "CACHE"
id = "YOUR_KV_ID_HERE"
```

## Step 2: Set Secrets

```bash
cd apps/api

# Generate a secure JWT secret (32+ characters)
wrangler secret put JWT_SECRET
# Enter a secure random string

# Add Anthropic API key for AI features
wrangler secret put ANTHROPIC_API_KEY
# Enter your Anthropic API key
```

## Step 3: Deploy API (Cloudflare Workers)

```bash
cd apps/api
npm install
npm run deploy
```

Note the URL output (e.g., `https://legaldocs-api.YOUR_SUBDOMAIN.workers.dev`)

## Step 4: Configure Frontend Environment

Update `apps/web/.env.local` for local development:
```env
NEXT_PUBLIC_API_URL=http://localhost:4001
```

For production, set environment variable in Cloudflare Pages dashboard:
```
NEXT_PUBLIC_API_URL=https://legaldocs-api.YOUR_SUBDOMAIN.workers.dev
```

## Step 5: Deploy Frontend (Cloudflare Pages)

### Option A: Via Dashboard (Recommended for first deployment)
1. Go to [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages)
2. Click "Create a project" > "Connect to Git"
3. Select your repository
4. Configure build settings:
   - **Framework preset**: Next.js
   - **Build command**: `cd apps/web && npm run pages:build`
   - **Build output directory**: `apps/web/.vercel/output/static`
   - **Root directory**: (leave empty)
5. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = your Workers API URL
6. Deploy

### Option B: Via CLI
```bash
cd apps/web
npm install
npm run pages:build
npx wrangler pages deploy .vercel/output/static --project-name=legaldocs-web
```

## Step 6: Configure Custom Domain (Optional)

### For API (Workers)
```bash
wrangler domains add api.yourdomain.com
```

### For Frontend (Pages)
1. Go to Cloudflare Pages dashboard
2. Select your project > Custom domains
3. Add your domain

## Local Development

### Run API locally
```bash
cd apps/api
npm run dev
# Runs on http://localhost:4001
```

### Run Frontend locally
```bash
cd apps/web
npm run dev
# Runs on http://localhost:3001
```

## Environment Variables Reference

### API (Workers) Secrets
| Secret | Description |
|--------|-------------|
| `JWT_SECRET` | Secret key for JWT signing (32+ chars) |
| `ANTHROPIC_API_KEY` | Claude API key for document generation |

### Frontend (Pages) Environment Variables
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Full URL to Workers API |

## Troubleshooting

### CORS Issues
Ensure `apps/api/src/index.ts` includes your frontend domain in CORS origins:
```typescript
app.use('*', cors({
  origin: ['http://localhost:3001', 'https://legaldocs-web.pages.dev', 'https://yourdomain.com'],
  credentials: true,
}));
```

### Database Not Found
Run schema migration:
```bash
wrangler d1 execute legaldocs-db --file=./schema.sql
```

### Build Failures
Ensure Node.js version 18+ is used. Add `.nvmrc` or set in Pages dashboard.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Cloudflare Network                    │
├─────────────────────────┬───────────────────────────────┤
│   Cloudflare Pages      │     Cloudflare Workers        │
│   (Next.js Frontend)    │     (Hono API)                │
│                         │                               │
│   - Static assets       │   - Auth endpoints            │
│   - SSR/SSG pages       │   - Document CRUD             │
│   - i18n (EN/AR/UR)     │   - AI generation             │
│   - RTL support         │   - Template management       │
├─────────────────────────┼───────────────────────────────┤
│                         │                               │
│   Cloudflare R2         │     Cloudflare D1             │
│   (File Storage)        │     (SQLite Database)         │
│                         │                               │
│   - PDF documents       │   - Users                     │
│   - Uploaded files      │   - Documents                 │
│   - Signatures          │   - Templates                 │
│                         │   - Signers                   │
├─────────────────────────┼───────────────────────────────┤
│                         │                               │
│   Cloudflare KV         │     External Services         │
│   (Cache)               │                               │
│                         │   - Anthropic (Claude AI)     │
│   - Session data        │   - Twilio (WhatsApp)         │
│   - Rate limiting       │   - Polygon (Blockchain)      │
│                         │   - Sumsub (ID verify)        │
└─────────────────────────┴───────────────────────────────┘
```
