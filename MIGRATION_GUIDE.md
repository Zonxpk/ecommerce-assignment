# Migration Guide: Next.js API to Express.js

This guide shows how to gradually migrate API routes from Next.js to Express.js or proxy them.

## Option 1: Proxy Next.js API Routes to Express (Recommended for Gradual Migration)

Keep your Next.js API routes working but proxy certain endpoints to the Express server.

### Example: Proxy `/api/dashboard` to Express

**File:** `apps/web/app/api/dashboard/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";

const EXPRESS_API_URL = process.env.EXPRESS_API_URL || "http://localhost:3001";

// GET /api/dashboard - Proxy to Express server
export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const queryString = searchParams.toString();
		
		const response = await fetch(
			`${EXPRESS_API_URL}/api/dashboard?${queryString}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			}
		);

		const data = await response.json();
		return NextResponse.json(data, { status: response.status });
	} catch (error) {
		console.error("Error proxying to Express:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to fetch dashboard data" },
			{ status: 500 }
		);
	}
}
```

### Environment Configuration

**File:** `apps/web/.env.local`

```env
# Express server URL for API proxying
EXPRESS_API_URL=http://localhost:3001
```

**File:** `.env.production` (for production)

```env
EXPRESS_API_URL=http://server:3001
```

---

## Option 2: Direct Migration (Replace Next.js Routes)

If you want to completely remove Next.js API routes and use only Express, follow these steps.

### Step 1: Update Frontend to Call Express Endpoints

Instead of calling `/api/dashboard`, call the Express server directly:

```typescript
// Before (Next.js API)
const response = await fetch("/api/dashboard?days=30");

// After (Express API)
const EXPRESS_API_URL = process.env.NEXT_PUBLIC_EXPRESS_API_URL || "http://localhost:3001";
const response = await fetch(`${EXPRESS_API_URL}/api/dashboard?days=30`);
```

**File:** `apps/web/app/admin/page.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";

const EXPRESS_API_URL = process.env.NEXT_PUBLIC_EXPRESS_API_URL || "http://localhost:3001";

export default function AdminPage() {
	const [analytics, setAnalytics] = useState(null);

	useEffect(() => {
		const fetchDashboard = async () => {
			const response = await fetch(`${EXPRESS_API_URL}/api/dashboard?days=30`);
			const data = await response.json();
			setAnalytics(data.data);
		};

		fetchDashboard();
	}, []);

	// ... rest of component
}
```

### Step 2: Update Environment Variables

**File:** `apps/web/.env.local`

```env
NEXT_PUBLIC_EXPRESS_API_URL=http://localhost:3001
```

**File:** `apps/web/.env.production` (for production)

```env
NEXT_PUBLIC_EXPRESS_API_URL=https://api.yourdomain.com
```

### Step 3: Delete Redundant Next.js Routes

Once migrated to Express, you can delete these Next.js route files:

```bash
# Remove these files if functionality is in Express
rm -r apps/web/app/api/dashboard
rm -r apps/web/app/api/products/[id]/offers
```

Keep these in Next.js for admin UI:
- `/api/campaigns` - Campaign CRUD (lightweight)
- `/api/links` - Link CRUD (lightweight)
- `/api/go/[shortCode]` - Redirect tracking (needs low latency)

---

## Option 3: Hybrid Approach (Recommended)

Separate concerns based on computational load:

### Keep in Next.js (Light Operations)
```
/api/campaigns         # Campaign CRUD
/api/links            # Link CRUD
/api/products         # Product list & add (simple)
/api/go/[shortCode]   # Click tracking redirects
```

### Move to Express (Heavy Operations)
```
/api/dashboard        # Complex analytics aggregation
/api/products/sync    # Bulk marketplace scraping
/api/webhooks/*       # Marketplace integrations
```

### Implementation

**Next.js Route Example:**
```typescript
// apps/web/app/api/campaigns/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
	// Keep simple CRUD in Next.js
	const campaigns = await prisma.campaign.findMany();
	return NextResponse.json({ success: true, data: campaigns });
}
```

**Using Shared Prisma:**

Update Next.js to also use the shared db package:

```bash
# Update apps/web/package.json dependencies
"@packages/db": "workspace:*"
```

Then in Next.js routes:
```typescript
import prisma from "@packages/db";

// Now both apps use same Prisma instance
```

---

## Fetching Data from Express in Next.js Client Components

### Fetch Helper Utility

**File:** `apps/web/lib/api-client.ts`

```typescript
const EXPRESS_API_URL = 
	process.env.NEXT_PUBLIC_EXPRESS_API_URL || "http://localhost:3001";

interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
}

export async function fetchFromExpress<T>(
	endpoint: string,
	options?: RequestInit
): Promise<ApiResponse<T>> {
	try {
		const url = `${EXPRESS_API_URL}${endpoint}`;
		const response = await fetch(url, {
			...options,
			headers: {
				"Content-Type": "application/json",
				...options?.headers,
			},
		});

		if (!response.ok) {
			const error = await response.json();
			return {
				success: false,
				error: error.error || "Request failed",
			};
		}

		const data = await response.json();
		return data;
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}
```

### Usage in Components

```typescript
import { fetchFromExpress } from "@/lib/api-client";

// In client component
const response = await fetchFromExpress("/api/dashboard", {
	method: "GET",
});

if (response.success) {
	console.log(response.data);
} else {
	console.error(response.error);
}
```

---

## CORS Configuration for Express

If Express and Next.js are on different domains/ports, CORS is already configured:

**File:** `apps/server/src/server.ts`

```typescript
import cors from "cors";

app.use(cors()); // Allows all origins for development

// For production, restrict origins:
app.use(cors({
	origin: process.env.ALLOWED_ORIGINS?.split(",") || "http://localhost:3000",
	credentials: true,
}));
```

---

## Deployment Considerations

### Local Development
```bash
bun run dev  # Runs both Next.js (3000) and Express (3001)
```

### Docker Compose
Both services run on the same network, so they can communicate:
```yaml
services:
  web:
    ports:
      - "3000:3000"
  server:
    ports:
      - "3001:3001"
    # Can reach web at http://web:3000
    # Web can reach server at http://server:3001
```

### Production
Set `EXPRESS_API_URL` to your Express server domain:
```env
NEXT_PUBLIC_EXPRESS_API_URL=https://api.yourdomain.com
```

---

## Checklist for Migration

- [ ] Decide on migration strategy (proxy, direct, hybrid)
- [ ] Update environment variables in `.env.local` and `.env.production`
- [ ] Create fetch utility helper if using Express directly
- [ ] Update client components to call Express endpoints
- [ ] Test both local development and production URLs
- [ ] Update API documentation
- [ ] Deploy Express server
- [ ] Monitor for any API issues post-deployment
- [ ] Remove old Next.js API routes once confirmed working

---

## Troubleshooting

### CORS Errors
Ensure `cors` middleware is enabled in Express:
```typescript
app.use(cors());
```

### Connection Refused
Check that:
- Express server is running on correct port (default 3001)
- `EXPRESS_API_URL` environment variable is correct
- Firewall allows connections between servers

### TypeScript Errors in Next.js
Ensure shared package references are correct:
```json
{
  "dependencies": {
    "@packages/db": "workspace:*"
  }
}
```

---

## Questions or Issues?

See the full Express setup guide: `EXPRESS_SETUP.md`
