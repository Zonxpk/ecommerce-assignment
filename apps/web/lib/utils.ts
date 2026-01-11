import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatPrice(
	price: number | string | { toNumber?: () => number },
): string {
	let numPrice: number;
	if (
		typeof price === "object" &&
		price !== null &&
		"toNumber" in price &&
		typeof price.toNumber === "function"
	) {
		numPrice = price.toNumber();
	} else if (typeof price === "string") {
		numPrice = parseFloat(price);
	} else {
		numPrice = price as number;
	}
	return new Intl.NumberFormat("th-TH", {
		style: "currency",
		currency: "THB",
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	}).format(numPrice);
}

export function generateShortCode(length: number = 6): string {
	const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
	let result = "";
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}

export function buildTargetUrl(
	originalUrl: string,
	utmParams: {
		campaign?: string;
		source?: string;
		medium?: string;
	},
): string {
	const url = new URL(originalUrl);
	if (utmParams.campaign)
		url.searchParams.set("utm_campaign", utmParams.campaign);
	if (utmParams.source) url.searchParams.set("utm_source", utmParams.source);
	if (utmParams.medium) url.searchParams.set("utm_medium", utmParams.medium);
	return url.toString();
}
