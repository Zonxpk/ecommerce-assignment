# Express.js Integration Architecture

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                            │
│                    (Browser / Mobile App)                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓↑
              HTTP/CORS Requests & Responses
                              ↓↑
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                             │
│                   Next.js + React 19                            │
│                    (Port 3000)                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ UI Components                                            │  │
│  │ ├── Admin Dashboard                                     │  │
│  │ ├── Product Management                                 │  │
│  │ ├── Campaign Manager                                   │  │
│  │ └── Analytics Views                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Remaining API Routes (Lightweight CRUD)                │  │
│  │ ├── /api/campaigns/*                                   │  │
│  │ ├── /api/links/*                                       │  │
│  │ └── /api/go/[shortCode]  (Redirects)                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
         ↓                                           ↓
    Proxy or                                    Direct Call
    Call through                                (if migrated)
         ↓                                           ↓
┌──────────────────────────┐      ┌──────────────────────────────┐
│    API GATEWAY OPTION    │      │    DIRECT CALL OPTION        │
│  (API proxy routes)      │      │  (Skip next.js routes)       │
└──────────────────────────┘      └──────────────────────────────┘
         ↓                                           ↓
         └──────────────────────┬──────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER                                  │
│                   Express.js Server                             │
│                   (Port 3001)                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Middleware Stack                                        │  │
│  │ ├── CORS Handler                                        │  │
│  │ ├── Body Parser (JSON/URLEncoded)                      │  │
│  │ ├── Request Validation (Zod)                           │  │
│  │ ├── Async Error Handler                                │  │
│  │ └── Error Response Formatter                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Heavy Computation Routes                               │  │
│  │ ├── GET  /api/dashboard          (Analytics)          │  │
│  │ ├── POST /api/products            (Marketplace)       │  │
│  │ ├── GET  /api/products/*          (Product CRUD)      │  │
│  │ ├── GET  /api/products/:id/offers (Offers)           │  │
│  │ └── POST /api/webhooks/*          (Integrations)      │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Utility Functions                                       │  │
│  │ ├── formatPrice()      → Currency formatting           │  │
│  │ ├── buildTargetUrl()   → URL with UTM params           │  │
│  │ └── generateShortCode()→ Random short codes            │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
         ↓                                           ↓
    Marketplace                              Shared Dependencies
    Adapters                                (Bun Workspace)
    (Lazada/Shopee)                              ↓
         ↓                           ┌───────────────────────────┐
         ↓                           │ Shared Packages          │
         ↓                           │ ├── @packages/db         │
         ↓                           │ │   (Prisma Client)      │
         ↓                           │ ├── packages/shared      │
         ↓                           │ │   (Types & Schemas)    │
         ↓                           │ └── packages/adapters    │
         ↓                           │     (Marketplaces)      │
         ↓                           └───────────────────────────┘
         └──────────────────────┬──────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                   │
│                PostgreSQL Database                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Tables:                                                 │  │
│  │ ├── products      (Product catalog)                    │  │
│  │ ├── offers        (Marketplace listings)               │  │
│  │ ├── campaigns     (Affiliate campaigns)                │  │
│  │ ├── links         (Short affiliate links)              │  │
│  │ └── clicks        (Analytics tracking)                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Examples

### Example 1: Get Analytics Dashboard

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ GET /admin/dashboard
       ↓
┌──────────────────────────┐
│   Next.js Admin Page     │
│ (apps/web/app/admin/)    │
└──────┬───────────────────┘
       │ fetch('/api/dashboard?days=30')
       │ OR
       │ fetch('http://localhost:3001/api/dashboard?days=30')
       ↓
┌──────────────────────────┐
│ Express Dashboard Route   │
│ (/api/dashboard)        │
└──────┬───────────────────┘
       │ Group by campaign, marketplace
       │ Aggregate click counts
       │ Calculate trends
       ↓
┌──────────────────────────┐
│  PostgreSQL Database     │
│  - Query clicks table    │
│  - Join with links       │
│  - Join with campaigns   │
└──────┬───────────────────┘
       │ Return aggregated data
       ↓
┌──────────────────────────┐
│ Analytics Response JSON  │
│ {                        │
│   totalClicks: 1250,     │
│   clicksByCampaign: [...],
│   topProducts: [...],    │
│   trends: [...]          │
│ }                        │
└──────┬───────────────────┘
       │ Display in charts
       ↓
┌──────────────────────────┐
│ Analytics Dashboard      │
│ Charts & Statistics      │
└──────────────────────────┘
```

### Example 2: Add New Product from Marketplace

```
┌──────────────────────────┐
│ Admin Product Form       │
│ (Next.js Client)         │
└──────┬───────────────────┘
       │ POST /api/products
       │ {
       │   url: "https://lazada.com/...",
       │   marketplace: "LAZADA"
       │ }
       ↓
┌──────────────────────────┐
│ Express Product Route    │
│ POST /api/products       │
└──────┬───────────────────┘
       │ Validate input with Zod
       │ Extract marketplace
       ↓
┌──────────────────────────┐
│ Marketplace Adapter      │
│ (packages/adapters)      │
└──────┬───────────────────┘
       │ Fetch from Lazada/Shopee API
       │ Extract title, price, image
       │ Build structured data
       ↓
┌──────────────────────────┐
│ Store in Database        │
│ (Prisma Client)          │
└──────┬───────────────────┘
       │ Create product record
       │ Create offer record
       │ Link to campaign
       ↓
┌──────────────────────────┐
│ Return Created Product   │
│ {                        │
│   isNew: true,           │
│   product: {             │
│     id, title, offers... │
│   }                      │
│ }                        │
└──────┬───────────────────┘
       │ Update UI
       ↓
┌──────────────────────────┐
│ Product Added Message    │
│ Refresh product list     │
└──────────────────────────┘
```

---

## 🔄 Monorepo Structure & Dependencies

```
ecommerce-assignment/
│
├── apps/
│   ├── web/
│   │   ├── (Next.js app - unchanged)
│   │   └── depends on:
│   │       ├── @packages/db
│   │       ├── packages/shared
│   │       └── packages/adapters
│   │
│   └── server/  ✨ NEW
│       ├── Express.js API server
│       └── depends on:
│           ├── @packages/db
│           ├── packages/shared
│           └── packages/adapters
│
├── packages/
│   ├── db/  ✨ NEW
│   │   └── Shared Prisma client
│   │       (used by both web & server)
│   │
│   ├── shared/
│   │   └── Types, schemas, constants
│   │       (used by all apps)
│   │
│   └── adapters/
│       └── Marketplace fetchers
│           (Lazada, Shopee)
│           └── depends on: packages/shared
│
└── infra/
    └── docker-compose.yml
        ├── service: web (Next.js on 3000)
        ├── service: server (Express on 3001)
        └── service: postgres (Database)
```

---

## 🔌 Request Flow Patterns

### Pattern 1: Direct Express Call from Next.js UI
```
Browser
  ↓
Next.js Component
  ↓
fetch('http://localhost:3001/api/...')
  ↓
Express Server
  ↓
Prisma
  ↓
PostgreSQL
  ↓
Response back to Browser
```

### Pattern 2: Proxy Through Next.js API
```
Browser
  ↓
Next.js Component
  ↓
fetch('/api/dashboard')
  ↓
Next.js API Route (Proxy)
  ↓
fetch('http://localhost:3001/api/dashboard')
  ↓
Express Server
  ↓
Response back to Browser
```

### Pattern 3: Server-to-Server Communication
```
Next.js Server
(during getServerSideProps)
  ↓
fetch('http://server:3001/api/...')
  ↓
Express Server
  (Docker network)
  ↓
Response back to Next.js
```

---

## 📦 Dependency Tree

```
ecommerce-assignment
├── @prisma/client (v5.22.0)
├── @types/node
├── typescript
│
├── apps/web
│   ├── next (v15.1.2)
│   ├── react (v19.0.0)
│   ├── zod (v3.24.1)
│   ├── @prisma/client ─┐
│   ├── shared ─────────┤
│   └── adapters ───────┤
│                       │
└── apps/server        │
    ├── express (v4.18.2)
    ├── cors
    ├── dotenv
    ├── @prisma/client ──┴─ SHARED ✨
    ├── @packages/db ────┐
    │                    ├─ Uses same Prisma
    ├── shared ────┬─────┤  instance
    └── adapters ──┘

apps/web and apps/server both use:
  - Same Prisma client (@packages/db)
  - Same types (packages/shared)
  - Same adapters (packages/adapters)
```

---

## 🔐 Request Validation Flow

```
Incoming Request
    ↓
CORS Middleware
    │ ├─ Check origin
    │ └─ Add CORS headers
    ↓
Body Parser
    │ ├─ Parse JSON
    │ └─ Parse URLEncoded
    ↓
Route Handler
    ↓
Zod Validation
    │ ├─ Validate schema
    │ └─ Return detailed errors if invalid
    ↓
Business Logic
    │ ├─ Query database
    │ ├─ Call adapters
    │ └─ Perform computations
    ↓
Response Formatter
    │ ├─ Format as JSON
    │ ├─ Add success/error fields
    │ └─ Set status code
    ↓
Send Response
    ↓
Error Handler (if needed)
    │ ├─ Catch unhandled errors
    │ └─ Format error response
    ↓
Response to Client
```

---

## 🚀 Deployment Architecture

```
Local Development
├── Next.js Server (3000)
├── Express Server (3001)
└── PostgreSQL (5432)

Docker Compose (Development)
├── Service: web
│   └── Container: next dev
├── Service: server  ✨ NEW
│   └── Container: express dev
└── Service: postgres
    └── Container: postgres:15

Production (Docker)
├── Service: web
│   ├── Container: next start
│   └── Port: 3000
├── Service: server  ✨ NEW
│   ├── Container: node dist/server.js
│   └── Port: 3001
├── Service: postgres
│   └── Port: 5432 (internal)
└── Reverse Proxy (Nginx/Traefik)
    ├── web.domain.com → 3000
    ├── api.domain.com → 3001
    └── SSL/TLS termination
```

---

## 📈 Load Distribution

```
Before (All in Next.js):
Requests → Next.js (rendering + API) → Database
         High CPU & Memory usage
         Slower response times

After (Separated):
Requests ─┬→ Next.js (rendering only) ────┐
          │                               ├→ Database
          └→ Express (heavy API) ─────────┘
         Lower CPU/Memory per service
         Faster response times
         Independent scaling
```

---

## 🔄 Update & Deployment Flow

```
Code Change
    ↓
├─ Next.js change → next dev auto-reload
│
└─ Express change → tsx watch auto-reload
    ↓
Test locally
    ↓
Commit & Push
    ↓
CI/CD Pipeline
    ├─ Build packages/db
    ├─ Build apps/web
    ├─ Build apps/server
    ├─ Run tests
    └─ Build Docker images
    ↓
Deploy to Production
    ├─ Docker Compose up
    ├─ Run migrations
    └─ Start services
```

---

This architecture provides **scalability**, **maintainability**, and **flexibility** for the ecommerce affiliate platform.
