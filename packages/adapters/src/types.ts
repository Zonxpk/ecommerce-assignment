import { ProductData, FetchProductResult, Marketplace } from "shared";

export interface MarketplaceAdapter {
	marketplace: Marketplace;
	fetchProduct(url: string): Promise<FetchProductResult>;
	isValidUrl(url: string): boolean;
}
