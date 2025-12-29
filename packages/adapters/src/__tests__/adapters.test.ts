import { describe, it, expect } from "bun:test";
import { lazadaAdapter } from "../src/lazada";
import { shopeeAdapter } from "../src/shopee";
import { fetchProductData, detectMarketplace } from "../src/fetch";
import { Marketplace } from "shared";

describe("Lazada Adapter", () => {
	it("should validate Lazada URLs correctly", () => {
		expect(
			lazadaAdapter.isValidUrl("https://www.lazada.co.th/products/test.html"),
		).toBe(true);
		expect(
			lazadaAdapter.isValidUrl("https://lazada.com/products/test.html"),
		).toBe(true);
		expect(lazadaAdapter.isValidUrl("https://shopee.co.th/product/123")).toBe(
			false,
		);
		expect(lazadaAdapter.isValidUrl("not-a-url")).toBe(false);
	});

	it("should fetch product data from Lazada URL", async () => {
		const result = await lazadaAdapter.fetchProduct(
			"https://www.lazada.co.th/products/matcha-powder-i123456.html",
		);

		expect(result.success).toBe(true);
		expect(result.data).toBeDefined();
		expect(result.data?.marketplace).toBe(Marketplace.LAZADA);
		expect(result.data?.title).toContain("Matcha");
	});

	it("should return error for invalid Lazada URL", async () => {
		const result = await lazadaAdapter.fetchProduct(
			"https://invalid-site.com/product",
		);

		expect(result.success).toBe(false);
		expect(result.error).toBeDefined();
	});
});

describe("Shopee Adapter", () => {
	it("should validate Shopee URLs correctly", () => {
		expect(
			shopeeAdapter.isValidUrl("https://shopee.co.th/product/123/456"),
		).toBe(true);
		expect(shopeeAdapter.isValidUrl("https://www.shopee.com/product")).toBe(
			true,
		);
		expect(
			shopeeAdapter.isValidUrl("https://www.lazada.co.th/products/test.html"),
		).toBe(false);
		expect(shopeeAdapter.isValidUrl("not-a-url")).toBe(false);
	});

	it("should fetch product data from Shopee URL", async () => {
		const result = await shopeeAdapter.fetchProduct(
			"https://shopee.co.th/product/matcha/123",
		);

		expect(result.success).toBe(true);
		expect(result.data).toBeDefined();
		expect(result.data?.marketplace).toBe(Marketplace.SHOPEE);
	});
});

describe("Marketplace Detection", () => {
	it("should detect Lazada marketplace from URL", () => {
		expect(
			detectMarketplace("https://www.lazada.co.th/products/test.html"),
		).toBe(Marketplace.LAZADA);
	});

	it("should detect Shopee marketplace from URL", () => {
		expect(detectMarketplace("https://shopee.co.th/product/123/456")).toBe(
			Marketplace.SHOPEE,
		);
	});

	it("should return null for unknown marketplace", () => {
		expect(detectMarketplace("https://amazon.com/product")).toBe(null);
	});
});

describe("Unified Fetch Product", () => {
	it("should fetch from Lazada adapter", async () => {
		const result = await fetchProductData(
			"https://www.lazada.co.th/products/yoga-mat-i345678.html",
			Marketplace.LAZADA,
		);

		expect(result.success).toBe(true);
		expect(result.data?.marketplace).toBe(Marketplace.LAZADA);
	});

	it("should fetch from Shopee adapter", async () => {
		const result = await fetchProductData(
			"https://shopee.co.th/product/earbuds/123",
			Marketplace.SHOPEE,
		);

		expect(result.success).toBe(true);
		expect(result.data?.marketplace).toBe(Marketplace.SHOPEE);
	});
});
