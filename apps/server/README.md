# Express.js API Server

This is the Express.js backend server for the ecommerce affiliate project. It handles heavy computational tasks and analytics that are decoupled from the Next.js frontend.

## Features

- **Dashboard Analytics** (`GET /api/dashboard`) - Complex queries for campaign performance, clicks by marketplace, top products, and click trends
- **Products Management** (`GET/POST/DELETE /api/products`) - Manage products and fetch data from Lazada/Shopee adapters
- **Webhooks** (`POST /api/webhooks`) - Marketplace integration endpoints (placeholder)
- **Health Check** (`GET /health`) - Server health status

## Setup

### Prerequisites
- Node.js 18+ (or Bun)
- PostgreSQL database
- Environment variables configured

### Installation

```bash
# Install dependencies (from root workspace)
bun install

# Copy environment file
cp apps/server/.env.example apps/server/.env

# Edit .env with your database credentials
```

### Configuration

Set these environment variables in `apps/server/.env`:

```env
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce
DIRECT_URL=postgresql://user:password@localhost:5432/ecommerce
NODE_ENV=development
```

## Development

### Run the server

```bash
# From root directory - run both Next.js and Express
bun run dev

# Or run just the server
bun run dev:server

# From server directory
bun run dev
```

The server will start on `http://localhost:3001`

### Health Check

```bash
curl http://localhost:3001/health
```

Response:
```json
{ "status": "ok" }
```

## Building & Production

```bash
# Build all packages (from root)
bun run build

# Or build just the server
bun run build:server

# Start production server
bun run start:server
```

## API Routes

### Dashboard Analytics
```
GET /api/dashboard?days=30&campaignId=<id>
```
Returns analytics including:
- Total clicks, products, campaigns, links
- Clicks by campaign
- Clicks by marketplace
- Top products by click count
- Click trends over time

### Products
```
GET    /api/products                    # List all products with pagination
POST   /api/products                    # Add new product from marketplace URL
GET    /api/products/:id                # Get product details
DELETE /api/products/:id                # Delete product
GET    /api/products/:id/offers         # Get marketplace offers for a product
```

## Project Structure

```
apps/server/
├── src/
│   ├── server.ts          # Express app entry point
│   ├── utils.ts           # Utility functions (formatPrice, buildTargetUrl, etc)
│   ├── types/
│   │   └── response.ts    # Response interfaces and utilities
│   ├── middleware/
│   │   └── index.ts       # Validation, error handling, async wrapper
│   └── routes/
│       ├── dashboard.ts   # Analytics endpoints
│       ├── products.ts    # Product management endpoints
│       └── webhooks.ts    # Marketplace webhook placeholders
├── package.json
├── tsconfig.json
└── .env.example
```

## Database

Uses Prisma ORM with PostgreSQL. Database client is shared from `packages/db` to avoid duplication with Next.js app.

Models available:
- `Product` - Product catalog
- `Offer` - Marketplace-specific listings
- `Campaign` - Affiliate campaigns
- `Link` - Short affiliate links
- `Click` - Analytics tracking

For database migrations, use the root workspace commands:
```bash
bun run db:push
bun run db:migrate
bun run db:seed
```

## Marketplace Adapters

The server uses marketplace adapters from `packages/adapters` to fetch product data from:
- **Lazada** - Via `@packages/adapters/lazada`
- **Shopee** - Via `@packages/adapters/shopee`

## Deployment

### Docker

The server runs alongside the Next.js web app in Docker:

```yaml
# See infra/docker-compose.yml
services:
  web:
    # Next.js on port 3000
  server:
    # Express on port 3001
  postgres:
    # PostgreSQL database
```

### Environment Variables for Production

Required for production deployment:
- `NODE_ENV=production`
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (optional, defaults to 3001)

## Monitoring

The server includes request/response logging via Express. For monitoring in production, consider:
- Application Performance Monitoring (APM)
- Error tracking (Sentry, etc)
- Database query monitoring

## Next Steps

1. Configure environment variables
2. Install dependencies: `bun install`
3. Run database migrations: `bun run db:push`
4. Start dev server: `bun run dev:server`
5. Test health endpoint: `curl http://localhost:3001/health`
