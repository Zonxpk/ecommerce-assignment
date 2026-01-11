import { FetchProductResult, Marketplace } from "shared";
import { MarketplaceAdapter } from "../types";

// Mock product data for Shopee
const MOCK_SHOPEE_PRODUCTS: Record<string, FetchProductResult["data"]> = {
	default: {
		title: "Best Seller Product from Shopee",
		imageUrl: "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400",
		marketplace: Marketplace.SHOPEE,
		storeName: "Top Shopee Seller",
		price: 459.0,
		originalUrl: "https://shopee.co.th/product/123/456",
	},
	matcha: {
		title: "Organic Matcha Powder 100g - Japanese Grade A",
		imageUrl: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400",
		marketplace: Marketplace.SHOPEE,
		storeName: "GreenTea Shop",
		price: 279.0,
		originalUrl: "https://shopee.co.th/product/123/456",
	},
	earbuds: {
		title: "TWS Bluetooth 5.3 Earbuds - HiFi Stereo",
		imageUrl:
			"https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400",
		marketplace: Marketplace.SHOPEE,
		storeName: "TechGadget Store",
		price: 649.0,
		originalUrl: "https://shopee.co.th/product/789/012",
	},
	yoga: {
		title: "Yoga Mat 6mm Premium - Anti-Slip TPE",
		imageUrl:
			"https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400",
		marketplace: Marketplace.SHOPEE,
		storeName: "Yoga Essentials",
		price: 450.0,
		originalUrl: "https://shopee.co.th/product/345/678",
	},
	serum: {
		title: "Vitamin C Serum 30ml - Korean Skincare",
		imageUrl:
			"https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400",
		marketplace: Marketplace.SHOPEE,
		storeName: "K-Beauty Hub",
		price: 799.0,
		originalUrl: "https://shopee.co.th/product/901/234",
	},
};

function extractProductKeyFromUrl(url: string): string {
	const urlLower = url.toLowerCase();
	if (urlLower.includes("matcha")) return "matcha";
	if (urlLower.includes("earbuds") || urlLower.includes("tws"))
		return "earbuds";
	if (urlLower.includes("yoga") || urlLower.includes("mat")) return "yoga";
	if (urlLower.includes("serum") || urlLower.includes("vitamin"))
		return "serum";
	return "default";
}

export const shopeeAdapter: MarketplaceAdapter = {
	marketplace: Marketplace.SHOPEE,

	isValidUrl(url: string): boolean {
		try {
			const parsedUrl = new URL(url);
			return parsedUrl.hostname.includes("shopee");
		} catch {
			return false;
		}
	},

	async fetchProduct(url: string): Promise<FetchProductResult> {
		// Simulate network delay
		await new Promise((resolve) => setTimeout(resolve, 500));

		if (!this.isValidUrl(url)) {
			return {
				success: false,
				error: "Invalid Shopee URL",
			};
		}

		const productKey = extractProductKeyFromUrl(url);
		const mockProduct = MOCK_SHOPEE_PRODUCTS[productKey];

		// Add some price variation for realism
		const priceVariation = Math.random() * 50 - 25; // +/- 25 THB
		const adjustedPrice = Math.max(99, mockProduct!.price + priceVariation);

		return {
			success: true,
			data: {
				...mockProduct!,
				price: Math.round(adjustedPrice * 100) / 100,
				originalUrl: url,
			},
		};
	},
};

export { MOCK_SHOPEE_PRODUCTS };
