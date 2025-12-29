import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Define Marketplace as string constants since SQLite doesn't support enums
const Marketplace = {
	LAZADA: "LAZADA",
	SHOPEE: "SHOPEE",
} as const;

async function main() {
	console.log("🌱 Seeding database...");

	// Clean up existing data
	await prisma.click.deleteMany();
	await prisma.link.deleteMany();
	await prisma.offer.deleteMany();
	await prisma.campaign.deleteMany();
	await prisma.product.deleteMany();

	// Create sample products
	const matchaPowder = await prisma.product.create({
		data: {
			title: "Organic Matcha Green Tea Powder 100g",
			imageUrl:
				"https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400",
			offers: {
				create: [
					{
						marketplace: Marketplace.LAZADA,
						storeName: "TeaHouse Official",
						price: 299.0,
						originalUrl:
							"https://www.lazada.co.th/products/matcha-powder-i123456.html",
					},
					{
						marketplace: Marketplace.SHOPEE,
						storeName: "GreenTea Shop",
						price: 279.0,
						originalUrl: "https://shopee.co.th/product/123/456",
					},
				],
			},
		},
	});

	const wirelessEarbuds = await prisma.product.create({
		data: {
			title: "TWS Wireless Earbuds Bluetooth 5.3",
			imageUrl:
				"https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400",
			offers: {
				create: [
					{
						marketplace: Marketplace.LAZADA,
						storeName: "Audio Zone",
						price: 599.0,
						originalUrl:
							"https://www.lazada.co.th/products/tws-earbuds-i789012.html",
					},
					{
						marketplace: Marketplace.SHOPEE,
						storeName: "TechGadget Store",
						price: 649.0,
						originalUrl: "https://shopee.co.th/product/789/012",
					},
				],
			},
		},
	});

	const yogaMat = await prisma.product.create({
		data: {
			title: "Premium Yoga Mat 6mm Non-Slip",
			imageUrl:
				"https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400",
			offers: {
				create: [
					{
						marketplace: Marketplace.LAZADA,
						storeName: "FitLife Store",
						price: 450.0,
						originalUrl:
							"https://www.lazada.co.th/products/yoga-mat-i345678.html",
					},
					{
						marketplace: Marketplace.SHOPEE,
						storeName: "Yoga Essentials",
						price: 450.0,
						originalUrl: "https://shopee.co.th/product/345/678",
					},
				],
			},
		},
	});

	const skincare = await prisma.product.create({
		data: {
			title: "Vitamin C Serum 30ml - Brightening",
			imageUrl:
				"https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400",
			offers: {
				create: [
					{
						marketplace: Marketplace.LAZADA,
						storeName: "BeautyLab Official",
						price: 890.0,
						originalUrl:
							"https://www.lazada.co.th/products/vitamin-c-serum-i901234.html",
					},
					{
						marketplace: Marketplace.SHOPEE,
						storeName: "K-Beauty Hub",
						price: 799.0,
						originalUrl: "https://shopee.co.th/product/901/234",
					},
				],
			},
		},
	});

	// Create sample campaigns
	const summerCampaign = await prisma.campaign.create({
		data: {
			name: "Summer Deal 2025",
			slug: "summer-deal-2025",
			utmCampaign: "summer2025",
			utmSource: "affiliate",
			utmMedium: "web",
			startAt: new Date("2025-06-01"),
			endAt: new Date("2025-08-31"),
			isActive: true,
		},
	});

	const newYearCampaign = await prisma.campaign.create({
		data: {
			name: "New Year Sale 2026",
			slug: "new-year-2026",
			utmCampaign: "newyear2026",
			utmSource: "affiliate",
			utmMedium: "web",
			startAt: new Date("2025-12-25"),
			endAt: new Date("2026-01-15"),
			isActive: true,
		},
	});

	// Create affiliate links
	const links = await Promise.all([
		prisma.link.create({
			data: {
				shortCode: "mat001",
				productId: matchaPowder.id,
				campaignId: summerCampaign.id,
				marketplace: Marketplace.SHOPEE,
				targetUrl:
					"https://shopee.co.th/product/123/456?utm_campaign=summer2025&utm_source=affiliate&utm_medium=web",
			},
		}),
		prisma.link.create({
			data: {
				shortCode: "mat002",
				productId: matchaPowder.id,
				campaignId: summerCampaign.id,
				marketplace: Marketplace.LAZADA,
				targetUrl:
					"https://www.lazada.co.th/products/matcha-powder-i123456.html?utm_campaign=summer2025&utm_source=affiliate&utm_medium=web",
			},
		}),
		prisma.link.create({
			data: {
				shortCode: "ear001",
				productId: wirelessEarbuds.id,
				campaignId: newYearCampaign.id,
				marketplace: Marketplace.LAZADA,
				targetUrl:
					"https://www.lazada.co.th/products/tws-earbuds-i789012.html?utm_campaign=newyear2026&utm_source=affiliate&utm_medium=web",
			},
		}),
		prisma.link.create({
			data: {
				shortCode: "skin001",
				productId: skincare.id,
				campaignId: newYearCampaign.id,
				marketplace: Marketplace.SHOPEE,
				targetUrl:
					"https://shopee.co.th/product/901/234?utm_campaign=newyear2026&utm_source=affiliate&utm_medium=web",
			},
		}),
	]);

	// Create sample clicks for analytics
	const now = new Date();
	const clicksData = [];

	for (let i = 0; i < 50; i++) {
		const randomLink = links[Math.floor(Math.random() * links.length)];
		const daysAgo = Math.floor(Math.random() * 30);
		const timestamp = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

		clicksData.push({
			linkId: randomLink.id,
			timestamp,
			referrer: ["https://google.com", "https://facebook.com", "direct", null][
				Math.floor(Math.random() * 4)
			],
			userAgent: "Mozilla/5.0 (compatible; sample data)",
			ipHash: `hash_${Math.random().toString(36).substring(7)}`,
		});
	}

	await prisma.click.createMany({
		data: clicksData,
	});

	console.log("✅ Seed completed!");
	console.log(`   - ${4} products created`);
	console.log(`   - ${2} campaigns created`);
	console.log(`   - ${links.length} affiliate links created`);
	console.log(`   - ${clicksData.length} sample clicks created`);
}

main()
	.catch((e) => {
		console.error("❌ Seed failed:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
