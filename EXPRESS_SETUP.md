# Express.js Integration Implementation Summary

## ✅ Completed Setup

### 1. **Express.js Application Structure** (`apps/server/`)
- Created complete Express server with TypeScript configuration
- Organized into modular structure with routes, middleware, types, and utilities
- Configured for npm/bun workspace integration

**Files Created:**
- `apps/server/package.json` - Dependencies and scripts
- `apps/server/tsconfig.json` - TypeScript configuration
- `apps/server/src/server.ts` - Express app entry point
- `apps/server/.env.example` - Environment template
- `apps/server/README.md` - Complete documentation

### 2. **Shared Database Package** (`packages/db/`)
- Extracted Prisma client to prevent duplication across Next.js and Express
- Implements singleton pattern for database connections
- Can be imported by both web and server apps

**Files Created:**
- `packages/db/package.json` - Shared database package
- `packages/db/tsconfig.json` - TypeScript configuration
- `packages/db/src/index.ts` - Prisma singleton client

### 3. **Express Routes Migrated**

#### Dashboard Route (`/api/dashboard`)
```typescript
GET /api/dashboard?days=30&campaignId=<id>
```
- Analytics dashboard with complex aggregations
- Returns: clicks by campaign, marketplace, top products, click trends over time
- Location: `apps/server/src/routes/dashboard.ts`

#### Products Routes (`/api/products/*`)
```typescript
GET    /api/products              # List all products with pagination
POST   /api/products              # Add new product from marketplace URL
GET    /api/products/:id          # Get product details
DELETE /api/products/:id          # Delete product
GET    /api/products/:id/offers   # Get marketplace offers
```
- Full CRUD operations for products
- Marketplace adapter integration (Lazada/Shopee)
- Location: `apps/server/src/routes/products.ts`

#### Webhooks Route (`/api/webhooks/*`)
```typescript
POST /api/webhooks/shopee/:campaignId   # Placeholder for Shopee
POST /api/webhooks/lazada/:campaignId   # Placeholder for Lazada
```
- Ready for marketplace webhook implementations
- Location: `apps/server/src/routes/webhooks.ts`

### 4. **Middleware & Error Handling**
- **Request Validation**: Zod schema validation wrapper
- **Error Handling**: Centralized error handler with consistent responses
- **Async Wrapper**: Automatic error catching for async route handlers
- Location: `apps/server/src/middleware/index.ts`

**Features:**
- Validates body, query, and path parameters
- Returns structured API responses
- Handles ZodError with detailed validation messages
- Catches unhandled promise rejections

### 5. **Response Types & Utilities**
- Standardized API response format with success/data/error structure
- ApiError class for consistent error throwing
- sendResponse helper for formatting responses
- Location: `apps/server/src/types/response.ts`

### 6. **Utility Functions**
- `formatPrice()` - Format numbers as Thai Baht currency
- `generateShortCode()` - Generate random 6-character alphanumeric codes
- `buildTargetUrl()` - Add UTM parameters to URLs
- Location: `apps/server/src/utils.ts`

### 7. **Monorepo Integration**
- Updated root `package.json` with new scripts:
  - `npm run dev` - Run both Next.js and Express concurrently
  - `npm run dev:web` - Run only Next.js
  - `npm run dev:server` - Run only Express
  - `npm run build` - Build all packages
  - `npm run start:server` - Start production Express server

**Note:** Requires `concurrently` package to run both servers simultaneously (add to root devDependencies)

## 📁 Project Structure

```
ecommerce-assignment/
├── apps/
│   ├── web/
│   │   └── (existing Next.js app - unchanged)
│   └── server/                    ✨ NEW
│       ├── src/
│       │   ├── server.ts          # Express app entry
│       │   ├── utils.ts           # Utility functions
│       │   ├── types/
│       │   │   └── response.ts    # API response types
│       │   ├── middleware/
│       │   │   └── index.ts       # Validation & error handling
│       │   └── routes/
│       │       ├── dashboard.ts   # Analytics endpoints
│       │       ├── products.ts    # Product CRUD endpoints
│       │       └── webhooks.ts    # Webhook placeholders
│       ├── package.json
│       ├── tsconfig.json
│       ├── .env.example
│       └── README.md
├── packages/
│   ├── adapters/                  (existing, unchanged)
│   ├── shared/                    (existing, unchanged)
│   └── db/                        ✨ NEW
│       ├── src/
│       │   └── index.ts           # Shared Prisma client
│       ├── package.json
│       └── tsconfig.json
└── package.json                   (updated with server scripts)
```

## 🚀 Getting Started

### Install Dependencies
```bash
bun install
# or
npm install
```

### Configure Environment
```bash
cp apps/server/.env.example apps/server/.env
# Edit apps/server/.env with your database credentials
```

### Run Development
```bash
# Run both Next.js (port 3000) and Express (port 3001)
bun run dev

# Or run individually
bun run dev:web     # Next.js only
bun run dev:server  # Express only
```

### Test Endpoints
```bash
# Health check
curl http://localhost:3001/health

# Get analytics (example)
curl "http://localhost:3001/api/dashboard?days=30"

# List products
curl "http://localhost:3001/api/products?page=1&limit=10"
```

## 📝 Key Design Decisions

1. **Separate Express Server**: Keeps heavy computations (analytics, marketplace syncing) separate from Next.js rendering
2. **Shared Database Package**: Avoids duplication of Prisma setup between Next.js and Express
3. **Reused Utilities**: Uses same shared types and marketplace adapters as Next.js
4. **Modular Routes**: Each domain (dashboard, products, webhooks) is isolated in its own route file
5. **Centralized Error Handling**: Consistent API response format across all endpoints
6. **TypeScript First**: Full type safety across server, routes, and middleware

## ⚠️ Next Steps for Deployment

1. Add `concurrently` to root dependencies for dev command:
   ```bash
   bun add -d concurrently
   ```

2. Configure Docker setup (see `infra/docker-compose.yml`):
   - Add service for Express server on port 3001
   - Ensure database connection shared between services

3. Set production environment variables:
   - `NODE_ENV=production`
   - `DATABASE_URL` with production PostgreSQL URI
   - `PORT` (optional, defaults to 3001)

4. Optional: Integrate Next.js API proxy to Express server:
   - Keep lightweight CRUD in Next.js
   - Route heavy operations to Express
   - Example: `/api/dashboard` → `http://localhost:3001/api/dashboard`

## 📦 Dependencies Added

**Server:**
- `express` - Web framework
- `cors` - CORS middleware
- `dotenv` - Environment configuration

**Dev:**
- `@types/express` - TypeScript definitions
- `tsx` - TypeScript executor for development
- `ts-jest` - Jest TypeScript support

**Shared (db package):**
- `@prisma/client` - Database client

All dependencies are compatible with existing project packages.

---

Express.js is now fully integrated and ready to handle API routes! Start with `bun run dev` to run both servers.
