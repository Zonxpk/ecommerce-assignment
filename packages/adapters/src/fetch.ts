import { FetchProductResult, Marketplace } from "shared";
import { lazadaAdapter } from "./lazada";
import { shopeeAdapter } from "./shopee";

export async function fetchProductData(
	url: string,
	marketplace: Marketplace,
): Promise<FetchProductResult> {
	switch (marketplace) {
		case Marketplace.LAZADA:
			return lazadaAdapter.fetchProduct(url);
		case Marketplace.SHOPEE:
			return shopeeAdapter.fetchProduct(url);
		default:
			return {
				success: false,
				error: `Unsupported marketplace: ${marketplace}`,
			};
	}
}

export function detectMarketplace(url: string): Marketplace | null {
	if (lazadaAdapter.isValidUrl(url)) return Marketplace.LAZADA;
	if (shopeeAdapter.isValidUrl(url)) return Marketplace.SHOPEE;
	return null;
}
