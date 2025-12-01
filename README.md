# LegalDocs

AI-powered legal document platform for GCC - Create, sign, and manage legal documents in Arabic, English, and Urdu.

## Features

- **AI Document Generation** - Natural language to legal documents
- **Multi-language Support** - English, Arabic (RTL), and Urdu (RTL)
- **E-Signatures** - Multi-party signing workflows
- **WhatsApp Integration** - Create and sign via WhatsApp
- **Blockchain Verification** - Tamper-proof document notarization
- **ID Verification** - Emirates ID and face matching

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS (with RTL support)
- shadcn/ui components
- next-intl (internationalization)

### Backend
- Fastify
- TypeScript
- Prisma (PostgreSQL)
- Redis (caching)

### External Services
- Anthropic Claude (AI)
- Twilio (WhatsApp)
- Polygon (Blockchain)
- Sumsub (ID Verification)
- Stripe (Payments)

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- npm or pnpm

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/legaldocs.git
   cd legaldocs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the database and services**
   ```bash
   docker-compose up -d
   ```

4. **Set up environment variables**
   ```bash
   cp apps/api/.env.example apps/api/.env
   # Edit .env with your credentials
   ```

5. **Run database migrations**
   ```bash
   npm run db:push
   ```

6. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Frontend: http://localhost:3000
   - API: http://localhost:4000
   - API Docs: http://localhost:4000/docs

## Project Structure

```
legaldocs/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/            # App router pages
│   │   │   ├── components/     # React components
│   │   │   ├── lib/            # Utilities
│   │   │   ├── locales/        # Translation files
│   │   │   └── styles/         # Global styles
│   │   └── package.json
│   │
│   └── api/                    # Fastify backend
│       ├── src/
│       │   ├── routes/         # API routes
│       │   ├── services/       # Business logic
│       │   ├── lib/            # Database & utilities
│       │   └── index.ts        # Entry point
│       ├── prisma/             # Database schema
│       └── package.json
│
├── packages/
│   ├── shared/                 # Shared types & utilities
│   └── contracts/              # Smart contracts
│
├── docker-compose.yml          # Local development services
├── turbo.json                  # Turborepo config
└── package.json                # Root package.json
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all services in development mode |
| `npm run build` | Build all packages |
| `npm run lint` | Lint all packages |
| `npm run db:push` | Push schema changes to database |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Prisma Studio |

## Environment Variables

### API (.env)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | Secret for JWT tokens |
| `ANTHROPIC_API_KEY` | Claude API key |
| `TWILIO_ACCOUNT_SID` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `RESEND_API_KEY` | Resend API key for emails |
| `STRIPE_SECRET_KEY` | Stripe secret key |

## Language Support

The platform supports three languages:
- **English (en)** - LTR
- **Arabic (ar)** - RTL
- **Urdu (ur)** - RTL

Translation files are located in `apps/web/src/locales/`.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software. All rights reserved.

## Support

For support, email support@legaldocs.ae or join our Slack channel.
