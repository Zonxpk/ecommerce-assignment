import { z } from "zod";

// Marketplace enum
export const Marketplace = {
	LAZADA: "LAZADA",
	SHOPEE: "SHOPEE",
} as const;

export type Marketplace = (typeof Marketplace)[keyof typeof Marketplace];

// Product types
export interface ProductData {
	title: string;
	description?: string;
	imageUrl: string | null;
	marketplace: Marketplace;
	storeName: string;
	price: number;
	originalUrl: string;
	productUrl?: string;
}

export interface FetchProductResult {
	success: boolean;
	data?: ProductData;
	error?: string;
}

// Validation schemas
export const createProductSchema = z.object({
	url: z.string().url("Please enter a valid URL"),
	marketplace: z.enum(["LAZADA", "SHOPEE"]),
});

export const createCampaignSchema = z.object({
	name: z.string().min(1, "Campaign name is required").max(100),
	slug: z
		.string()
		.min(1, "Slug is required")
		.max(50)
		.regex(
			/^[a-z0-9-]+$/,
			"Slug must be lowercase letters, numbers, and hyphens only",
		),
	utmCampaign: z.string().min(1, "UTM Campaign is required"),
	utmSource: z.string().optional(),
	utmMedium: z.string().optional(),
	startAt: z.string().optional(),
	endAt: z.string().optional(),
	isActive: z.boolean().default(true),
});

export const createLinkSchema = z.object({
	productId: z.string().min(1, "Product ID is required"),
	campaignId: z.string().min(1, "Campaign ID is required"),
	marketplace: z.enum(["LAZADA", "SHOPEE"]),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type CreateLinkInput = z.infer<typeof createLinkSchema>;
