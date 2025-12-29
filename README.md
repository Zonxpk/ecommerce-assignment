# Affiliate Platform - Lazada & Shopee Price Comparison

A mini web app for affiliate marketing with price comparison across Lazada and Shopee marketplaces. Built as a test assignment for Jenosize.

## 🎯 Features

- **Product & Price Comparison**: Add products from Lazada/Shopee URLs and compare prices
- **Campaign Management**: Create marketing campaigns with UTM tracking
- **Affiliate Link Generator**: Generate short trackable links for each product/campaign
- **Analytics Dashboard**: View click statistics, top products, and marketplace distribution
- **Public Landing Pages**: Campaign pages for end users to compare and buy

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│                    (Next.js App Router)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Public    │  │   Admin     │  │   Campaign Pages    │  │
│  │   Landing   │  │  Dashboard  │  │  /campaign/[slug]   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Routes (Express-like)                │
│  ┌──────────┐  ┌──────────┐  ┌───────┐  ┌─────────────────┐ │
│  │ Products │  │ Campaigns│  │ Links │  │ /go/:shortCode  │ │
│  │   API    │  │   API    │  │  API  │  │   (Redirect)    │ │
│  └──────────┘  └──────────┘  └───────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌─────────────────┐  ┌─────────────┐  ┌─────────────────────┐
│    Adapters     │  │   Prisma    │  │      Shared         │
│  (Lazada/Shopee)│  │    ORM      │  │   Types/Validators  │
└─────────────────┘  └─────────────┘  └─────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    └─────────────────┘
```

## 📁 Project Structure

```
ecommerce-affiliate/
├── apps/
│   └── web/                     # Next.js 15 App
│       ├── app/
│       │   ├── api/             # API Routes
│       │   │   ├── products/    # Product CRUD
│       │   │   ├── campaigns/   # Campaign CRUD
│       │   │   ├── links/       # Link generation
│       │   │   ├── dashboard/   # Analytics
│       │   │   └── docs/        # OpenAPI spec
│       │   ├── admin/           # Admin dashboard pages
│       │   ├── campaign/        # Public campaign pages
│       │   └── go/              # Redirect handler
│       ├── components/          # UI components (shadcn)
│       ├── lib/                 # Utilities
│       └── prisma/              # Database schema & seed
├── packages/
│   ├── adapters/                # Marketplace adapters
│   │   └── src/
│   │       ├── lazada/          # Lazada mock adapter
│   │       └── shopee/          # Shopee mock adapter
│   └── shared/                  # Shared types & validators
├── infra/
│   └── docker-compose.yml       # Local dev infrastructure
└── .github/
    └── workflows/
        └── ci.yml               # GitHub Actions CI
```

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org) (v18+)
- [npm](https://www.npmjs.com/) (v9+)
- [Docker](https://www.docker.com/) (for local PostgreSQL)

### Setup

1. **Clone and install dependencies**
   ```bash
   git clone https://github.com/your-repo/ecommerce-affiliate.git
   cd ecommerce-affiliate
   npm install
   ```

2. **Start the database**
   ```bash
   cd infra
   docker-compose up -d
   cd ..
   ```

3. **Configure environment**
   ```bash
   cp apps/web/.env.example apps/web/.env
   # Edit .env if needed (defaults work with Docker)
   ```

4. **Initialize database**
   ```bash
   npm run db:push      # Create tables
   npm run db:seed      # Seed sample data
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open the app**
   - Public site: http://localhost:3000
   - Admin dashboard: http://localhost:3000/admin
   - API docs: http://localhost:3000/api/docs

## 📊 Data Model

| Entity       | Key Fields                                                      |
| ------------ | --------------------------------------------------------------- |
| **Product**  | id, title, image_url                                            |
| **Offer**    | id, product_id, marketplace, store_name, price, last_checked_at |
| **Campaign** | id, name, slug, utm_campaign, start_at, end_at                  |
| **Link**     | id, product_id, campaign_id, short_code, target_url             |
| **Click**    | id, link_id, timestamp, referrer, user_agent                    |

## 🔌 API Endpoints

| Endpoint                       | Description                        |
| ------------------------------ | ---------------------------------- |
| `GET /api/products`            | List all products with offers      |
| `POST /api/products`           | Add product from Lazada/Shopee URL |
| `GET /api/products/:id/offers` | Get price comparison               |
| `GET /api/campaigns`           | List campaigns                     |
| `POST /api/campaigns`          | Create campaign                    |
| `POST /api/links`              | Generate affiliate link            |
| `GET /go/:shortCode`           | Redirect & track click             |
| `GET /api/dashboard`           | Analytics data                     |
| `GET /api/docs`                | OpenAPI specification              |

## 🧪 Testing

```bash
# Run adapter tests
cd packages/adapters && npm test

# Run web app tests
cd apps/web && npm run test
```

## 🛠️ Tech Stack

| Layer               | Technology                                    |
| ------------------- | --------------------------------------------- |
| **Frontend**        | Next.js 15, React 19, Tailwind CSS, shadcn/ui |
| **Backend**         | Next.js API Routes (Express-like)             |
| **Database**        | PostgreSQL + Prisma ORM                       |
| **Validation**      | Zod                                           |
| **Charts**          | Recharts                                      |
| **Package Manager** | npm                                           |
| **CI/CD**           | GitHub Actions                                |

## 🔮 Future Improvements

With more time, I would add:

1. **Real API Integration**: Replace mock adapters with actual Lazada/Shopee APIs or web scraping
2. **Background Jobs**: Cron job to refresh prices periodically (using Vercel Cron or Bull queue)
3. **Authentication**: Admin authentication with NextAuth.js
4. **Caching**: Redis caching for product data and dashboard aggregations
5. **Rate Limiting**: Protect API endpoints from abuse
6. **Real-time Updates**: WebSocket for live click tracking
7. **A/B Testing**: Multiple landing page variants per campaign
8. **Export**: CSV/Excel export for analytics data
9. **Notifications**: Alert when prices change significantly
10. **Mobile App**: React Native companion app

## 📝 Trade-offs & Decisions

| Decision               | Reasoning                                                                   |
| ---------------------- | --------------------------------------------------------------------------- |
| **Mock Adapters**      | Lazada/Shopee APIs require partner approval; mocks demonstrate architecture |
| **Monorepo**           | Better code organization and shared types between packages                  |
| **Prisma**             | Type-safe database queries, easy migrations, great DX                       |
| **Next.js API Routes** | Simplified deployment (single service), good for MVP                        |
| **No Auth**            | Kept scope manageable for demo; would add NextAuth.js in production         |

## 🎥 Demo

- **Demo URL**: [Your deployed URL]
- **Admin Access**: `/admin`
- **Sample Campaign**: `/campaign/summer-deal-2025`
- **Test Product**: Shopee vs Lazada Matcha Powder

## 📄 License

MIT

---

Built with ❤️ for Jenosize Lead Engineer Assessment
