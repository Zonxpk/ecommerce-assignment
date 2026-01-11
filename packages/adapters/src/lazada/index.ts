import { FetchProductResult, Marketplace } from "shared";
import { MarketplaceAdapter } from "../types";

// Mock product data for Lazada
const MOCK_LAZADA_PRODUCTS: Record<string, FetchProductResult["data"]> = {
	default: {
		title: "Premium Product from Lazada",
		imageUrl:
			"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
		marketplace: Marketplace.LAZADA,
		storeName: "Official Lazada Store",
		price: 499.0,
		originalUrl: "https://www.lazada.co.th/products/sample-product.html",
	},
	matcha: {
		title: "Organic Matcha Green Tea Powder 100g - Premium Grade",
		imageUrl: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400",
		marketplace: Marketplace.LAZADA,
		storeName: "TeaHouse Official",
		price: 299.0,
		originalUrl: "https://www.lazada.co.th/products/matcha-powder-i123456.html",
	},
	earbuds: {
		title: "TWS Wireless Earbuds Bluetooth 5.3 - Premium Sound",
		imageUrl:
			"https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400",
		marketplace: Marketplace.LAZADA,
		storeName: "Audio Zone Official",
		price: 599.0,
		originalUrl: "https://www.lazada.co.th/products/tws-earbuds-i789012.html",
	},
	yoga: {
		title: "Premium Yoga Mat 6mm Non-Slip - Eco Friendly",
		imageUrl:
			"https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400",
		marketplace: Marketplace.LAZADA,
		storeName: "FitLife Store",
		price: 450.0,
		originalUrl: "https://www.lazada.co.th/products/yoga-mat-i345678.html",
	},
	serum: {
		title: "Vitamin C Serum 30ml - Brightening & Anti-Aging",
		imageUrl:
			"https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400",
		marketplace: Marketplace.LAZADA,
		storeName: "BeautyLab Official",
		price: 890.0,
		originalUrl:
			"https://www.lazada.co.th/products/vitamin-c-serum-i901234.html",
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

export const lazadaAdapter: MarketplaceAdapter = {
	marketplace: Marketplace.LAZADA,

	isValidUrl(url: string): boolean {
		try {
			const parsedUrl = new URL(url);
			return parsedUrl.hostname.includes("lazada");
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
				error: "Invalid Lazada URL",
			};
		}

		const productKey = extractProductKeyFromUrl(url);
		const mockProduct = MOCK_LAZADA_PRODUCTS[productKey];

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

export { MOCK_LAZADA_PRODUCTS };
