# Express.js Integration - Quick Reference

## 📋 What Was Implemented

✅ **Express.js Server** with TypeScript  
✅ **Shared Database Package** (`packages/db`)  
✅ **3 Major Route Groups**:
- Dashboard Analytics
- Products Management  
- Webhooks (placeholder)

✅ **Middleware & Error Handling**  
✅ **Monorepo Integration**  
✅ **Complete Documentation**

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Configure database
cp apps/server/.env.example apps/server/.env
# Edit DATABASE_URL in apps/server/.env

# Run both servers
npm run dev

# Test health endpoint
curl http://localhost:3001/health
```

---

## 📂 File Structure

```
apps/server/                  ← NEW Express.js app
├── src/
│   ├── server.ts            ← Entry point
│   ├── middleware/          ← Validation, errors
│   ├── routes/              ← API endpoints
│   ├── types/               ← TypeScript interfaces
│   └── utils.ts             ← Helper functions
├── package.json
├── tsconfig.json
├── .env.example
└── README.md

packages/db/                  ← NEW Shared database
├── src/index.ts             ← Prisma singleton
├── package.json
└── tsconfig.json
```

---

## 🔌 API Endpoints

### Dashboard (Heavy Computation)
```
GET /api/dashboard?days=30&campaignId=<id>
```
Returns: Total clicks, by campaign, by marketplace, top products, trends

### Products (CRUD + Marketplace)
```
GET    /api/products?page=1&limit=10      # List with pagination
POST   /api/products                      # Add from marketplace URL
GET    /api/products/:id                  # Get details
DELETE /api/products/:id                  # Delete product
GET    /api/products/:id/offers           # Get marketplace offers
```

### Webhooks (Marketplace Integrations)
```
POST /api/webhooks/shopee/:campaignId
POST /api/webhooks/lazada/:campaignId
```

### Health
```
GET /health
```

---

## 🔧 Development Scripts

```bash
# From root directory
npm run dev              # Both Next.js & Express
npm run dev:web         # Next.js only (port 3000)
npm run dev:server      # Express only (port 3001)
npm run build           # Build all packages
npm run build:server    # Build Express only
npm run start:server    # Run production Express
```

---

## 📦 Dependencies Added

**Server:**
- `express` - Web framework
- `cors` - CORS middleware
- `dotenv` - Environment config

**Shared (db package):**
- `@prisma/client` - Database client

---

## 🔗 Using Express from Next.js

### Option A: Proxy Routes
Replace Next.js `/api/dashboard` to call Express:

```typescript
// apps/web/app/api/dashboard/route.ts
const EXPRESS_URL = process.env.EXPRESS_API_URL || "http://localhost:3001";
const response = await fetch(`${EXPRESS_URL}/api/dashboard`);
```

### Option B: Direct Client Calls
Call Express directly from React:

```typescript
const EXPRESS_URL = process.env.NEXT_PUBLIC_EXPRESS_API_URL || "http://localhost:3001";
const response = await fetch(`${EXPRESS_URL}/api/dashboard`);
```

Set in `apps/web/.env.local`:
```env
NEXT_PUBLIC_EXPRESS_API_URL=http://localhost:3001
```

---

## 🗄️ Database

Both apps share the same Prisma client from `packages/db`:

```typescript
import prisma from "@packages/db";

// Available models:
// - Product
// - Offer
// - Campaign
// - Link
// - Click
```

Database migrations still use Next.js commands:
```bash
npm run db:push
npm run db:migrate
npm run db:seed
```

---

## 📖 Documentation

- **EXPRESS_SETUP.md** - Complete Express setup guide
- **MIGRATION_GUIDE.md** - How to migrate/proxy Next.js routes
- **apps/server/README.md** - Server-specific documentation

---

## ⚙️ Environment Variables

**apps/server/.env:**
```env
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce
DIRECT_URL=postgresql://user:password@localhost:5432/ecommerce
NODE_ENV=development
```

**apps/web/.env.local:** (if calling Express directly)
```env
NEXT_PUBLIC_EXPRESS_API_URL=http://localhost:3001
```

---

## 🐳 Docker Deployment

Express runs on port 3001, Next.js on 3000:
```yaml
# infra/docker-compose.yml
services:
  web:
    ports: ["3000:3000"]
  server:
    ports: ["3001:3001"]
  postgres:
    # shared database
```

---

## ❓ Common Questions

**Q: Do I need to remove Next.js API routes?**  
A: No! Use the hybrid approach:
- Keep lightweight CRUD in Next.js
- Move heavy computations to Express

**Q: How do I share code between apps?**  
A: Use monorepo packages:
- `packages/db` - Database client
- `packages/shared` - Types & schemas
- `packages/adapters` - Marketplace adapters

**Q: What if CORS errors occur?**  
A: Already handled! Express has `cors()` middleware enabled.

**Q: Can I run just the Express server?**  
A: Yes! Use `npm run dev:server` (port 3001)

---

## 🎯 Next Steps

1. ✅ Install: `npm install`
2. ✅ Configure: Update `.env` files
3. ✅ Test: `npm run dev` and visit endpoints
4. ⏭️ Deploy: Push to production with Docker Compose

---

**Need help?** Check EXPRESS_SETUP.md or MIGRATION_GUIDE.md
