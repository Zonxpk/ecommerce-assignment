/**
 * @jest-environment node
 */

import { NextRequest } from "next/server";

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
	__esModule: true,
	default: {
		product: {
			findMany: jest.fn(),
			findUnique: jest.fn(),
			create: jest.fn(),
			delete: jest.fn(),
			count: jest.fn(),
		},
		offer: {
			findFirst: jest.fn(),
			findMany: jest.fn(),
			update: jest.fn(),
		},
		campaign: {
			findMany: jest.fn(),
			findUnique: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
			count: jest.fn(),
		},
		link: {
			findMany: jest.fn(),
			findUnique: jest.fn(),
			create: jest.fn(),
			count: jest.fn(),
		},
		click: {
			create: jest.fn(),
			count: jest.fn(),
			groupBy: jest.fn(),
		},
	},
}));

// Mock adapters
jest.mock("adapters", () => ({
	fetchProductData: jest.fn().mockResolvedValue({
		success: true,
		data: {
			title: "Test Product",
			imageUrl: "https://example.com/image.jpg",
			marketplace: "LAZADA",
			storeName: "Test Store",
			price: 299.0,
			originalUrl: "https://www.lazada.co.th/products/test.html",
		},
	}),
}));

import prisma from "@/lib/prisma";

describe("Products API", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("GET /api/products", () => {
		it("should return paginated products list", async () => {
			const mockProducts = [
				{
					id: "1",
					title: "Product 1",
					imageUrl: "https://example.com/1.jpg",
					offers: [],
					_count: { links: 0 },
				},
				{
					id: "2",
					title: "Product 2",
					imageUrl: "https://example.com/2.jpg",
					offers: [],
					_count: { links: 1 },
				},
			];

			(prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);
			(prisma.product.count as jest.Mock).mockResolvedValue(2);

			// Import after mocking
			const { GET } = await import("@/app/api/products/route");

			const request = new NextRequest("http://localhost:3000/api/products");
			const response = await GET(request);
			const json = await response.json();

			expect(json.success).toBe(true);
			expect(json.data).toHaveLength(2);
			expect(json.pagination).toBeDefined();
			expect(json.pagination.total).toBe(2);
		});
	});

	describe("POST /api/products", () => {
		it("should create a new product from URL", async () => {
			(prisma.offer.findFirst as jest.Mock).mockResolvedValue(null);
			(prisma.product.create as jest.Mock).mockResolvedValue({
				id: "new-id",
				title: "Test Product",
				imageUrl: "https://example.com/image.jpg",
				offers: [
					{
						id: "offer-1",
						marketplace: "LAZADA",
						storeName: "Test Store",
						price: 299.0,
						originalUrl: "https://www.lazada.co.th/products/test.html",
					},
				],
			});

			const { POST } = await import("@/app/api/products/route");

			const request = new NextRequest("http://localhost:3000/api/products", {
				method: "POST",
				body: JSON.stringify({
					url: "https://www.lazada.co.th/products/test.html",
					marketplace: "LAZADA",
				}),
			});

			const response = await POST(request);
			const json = await response.json();

			expect(json.success).toBe(true);
			expect(json.data.title).toBe("Test Product");
		});

		it("should return error for invalid marketplace", async () => {
			const { POST } = await import("@/app/api/products/route");

			const request = new NextRequest("http://localhost:3000/api/products", {
				method: "POST",
				body: JSON.stringify({
					url: "https://example.com/product",
					marketplace: "INVALID",
				}),
			});

			const response = await POST(request);
			const json = await response.json();

			expect(json.success).toBe(false);
			expect(response.status).toBe(400);
		});
	});
});

describe("Campaigns API", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("POST /api/campaigns", () => {
		it("should create a new campaign", async () => {
			(prisma.campaign.findUnique as jest.Mock).mockResolvedValue(null);
			(prisma.campaign.create as jest.Mock).mockResolvedValue({
				id: "campaign-1",
				name: "Test Campaign",
				slug: "test-campaign",
				utmCampaign: "test",
				utmSource: "affiliate",
				utmMedium: "web",
				isActive: true,
			});

			const { POST } = await import("@/app/api/campaigns/route");

			const request = new NextRequest("http://localhost:3000/api/campaigns", {
				method: "POST",
				body: JSON.stringify({
					name: "Test Campaign",
					slug: "test-campaign",
					utmCampaign: "test",
					utmSource: "affiliate",
					utmMedium: "web",
				}),
			});

			const response = await POST(request);
			const json = await response.json();

			expect(json.success).toBe(true);
			expect(json.data.name).toBe("Test Campaign");
		});

		it("should reject duplicate slugs", async () => {
			(prisma.campaign.findUnique as jest.Mock).mockResolvedValue({
				id: "existing",
				slug: "test-campaign",
			});

			const { POST } = await import("@/app/api/campaigns/route");

			const request = new NextRequest("http://localhost:3000/api/campaigns", {
				method: "POST",
				body: JSON.stringify({
					name: "Test Campaign",
					slug: "test-campaign",
					utmCampaign: "test",
				}),
			});

			const response = await POST(request);
			const json = await response.json();

			expect(json.success).toBe(false);
			expect(response.status).toBe(400);
		});
	});
});
