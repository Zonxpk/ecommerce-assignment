import { Elysia } from "elysia";
import { productsRoutes } from "./products";
import { campaignsRoutes } from "./campaigns";
import { linksRoutes } from "./links";
import { dashboardRoutes } from "./dashboard";

// OpenAPI spec for documentation
const openApiSpec = {
	openapi: "3.0.0",
	info: {
		title: "Affiliate Platform API",
		description:
			"API for managing products, campaigns, and affiliate links for Lazada/Shopee price comparison",
		version: "1.0.0",
		contact: {
			name: "API Support",
		},
	},
	servers: [
		{
			url: "/api",
			description: "API Server",
		},
	],
	paths: {
		"/products": {
			get: {
				summary: "List all products",
				description:
					"Get a paginated list of all products with their marketplace offers",
				parameters: [
					{
						name: "page",
						in: "query",
						schema: { type: "integer", default: 1 },
					},
					{
						name: "limit",
						in: "query",
						schema: { type: "integer", default: 10 },
					},
				],
				responses: {
					200: {
						description: "Successful response",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ProductListResponse" },
							},
						},
					},
				},
			},
			post: {
				summary: "Add a new product",
				description:
					"Fetch product data from Lazada or Shopee URL and add to database",
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: { $ref: "#/components/schemas/CreateProductInput" },
						},
					},
				},
				responses: {
					201: { description: "Product created successfully" },
					400: { description: "Invalid input" },
				},
			},
		},
		"/products/{id}": {
			get: {
				summary: "Get product by ID",
				parameters: [
					{
						name: "id",
						in: "path",
						required: true,
						schema: { type: "string" },
					},
				],
				responses: {
					200: { description: "Successful response" },
					404: { description: "Product not found" },
				},
			},
			delete: {
				summary: "Delete product",
				parameters: [
					{
						name: "id",
						in: "path",
						required: true,
						schema: { type: "string" },
					},
				],
				responses: {
					200: { description: "Product deleted" },
				},
			},
		},
		"/products/{id}/offers": {
			get: {
				summary: "Get offers for a product",
				parameters: [
					{
						name: "id",
						in: "path",
						required: true,
						schema: { type: "string" },
					},
				],
				responses: {
					200: { description: "Successful response with offers" },
					404: { description: "No offers found" },
				},
			},
		},
		"/campaigns": {
			get: {
				summary: "List all campaigns",
				parameters: [
					{
						name: "page",
						in: "query",
						schema: { type: "integer", default: 1 },
					},
					{
						name: "limit",
						in: "query",
						schema: { type: "integer", default: 10 },
					},
					{
						name: "active",
						in: "query",
						schema: { type: "boolean" },
						description: "Filter active campaigns only",
					},
				],
				responses: {
					200: { description: "Successful response" },
				},
			},
			post: {
				summary: "Create new campaign",
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: { $ref: "#/components/schemas/CreateCampaignInput" },
						},
					},
				},
				responses: {
					201: { description: "Campaign created" },
					400: { description: "Invalid input or slug exists" },
				},
			},
		},
		"/campaigns/{id}": {
			get: {
				summary: "Get campaign by ID",
				responses: {
					200: { description: "Successful response" },
					404: { description: "Campaign not found" },
				},
			},
			put: {
				summary: "Update campaign",
				responses: {
					200: { description: "Campaign updated" },
				},
			},
			delete: {
				summary: "Delete campaign",
				responses: {
					200: { description: "Campaign deleted" },
				},
			},
		},
		"/links": {
			get: {
				summary: "List all affiliate links",
				parameters: [
					{ name: "page", in: "query", schema: { type: "integer" } },
					{ name: "limit", in: "query", schema: { type: "integer" } },
					{ name: "campaignId", in: "query", schema: { type: "string" } },
					{ name: "productId", in: "query", schema: { type: "string" } },
				],
				responses: {
					200: { description: "Successful response" },
				},
			},
			post: {
				summary: "Generate affiliate link",
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: { $ref: "#/components/schemas/CreateLinkInput" },
						},
					},
				},
				responses: {
					201: { description: "Link created" },
					400: { description: "Invalid input" },
				},
			},
		},
		"/dashboard": {
			get: {
				summary: "Get analytics dashboard data",
				parameters: [
					{
						name: "days",
						in: "query",
						schema: { type: "integer", default: 30 },
					},
					{ name: "campaignId", in: "query", schema: { type: "string" } },
				],
				responses: {
					200: { description: "Dashboard data" },
				},
			},
		},
	},
	components: {
		schemas: {
			CreateProductInput: {
				type: "object",
				required: ["url", "marketplace"],
				properties: {
					url: { type: "string", format: "uri" },
					marketplace: { type: "string", enum: ["LAZADA", "SHOPEE"] },
				},
			},
			CreateCampaignInput: {
				type: "object",
				required: ["name", "slug", "utmCampaign"],
				properties: {
					name: { type: "string" },
					slug: { type: "string" },
					utmCampaign: { type: "string" },
					utmSource: { type: "string" },
					utmMedium: { type: "string" },
					startAt: { type: "string", format: "date-time" },
					endAt: { type: "string", format: "date-time" },
					isActive: { type: "boolean", default: true },
				},
			},
			CreateLinkInput: {
				type: "object",
				required: ["productId", "campaignId", "marketplace"],
				properties: {
					productId: { type: "string" },
					campaignId: { type: "string" },
					marketplace: { type: "string", enum: ["LAZADA", "SHOPEE"] },
				},
			},
			ProductListResponse: {
				type: "object",
				properties: {
					success: { type: "boolean" },
					data: {
						type: "array",
						items: { $ref: "#/components/schemas/Product" },
					},
					pagination: { $ref: "#/components/schemas/Pagination" },
				},
			},
			Product: {
				type: "object",
				properties: {
					id: { type: "string" },
					title: { type: "string" },
					imageUrl: { type: "string" },
					offers: {
						type: "array",
						items: { $ref: "#/components/schemas/Offer" },
					},
				},
			},
			Offer: {
				type: "object",
				properties: {
					id: { type: "string" },
					marketplace: { type: "string" },
					storeName: { type: "string" },
					price: { type: "number" },
					originalUrl: { type: "string" },
				},
			},
			Pagination: {
				type: "object",
				properties: {
					page: { type: "integer" },
					limit: { type: "integer" },
					total: { type: "integer" },
					totalPages: { type: "integer" },
				},
			},
		},
	},
};

// Create the main Elysia app with /api prefix for Next.js integration
export const app = new Elysia({ prefix: "/api" })
	// Docs endpoint
	.get("/docs", () => openApiSpec)
	// Use route modules
	.use(productsRoutes)
	.use(campaignsRoutes)
	.use(linksRoutes)
	.use(dashboardRoutes);

// Export type for Eden client
export type App = typeof app;
