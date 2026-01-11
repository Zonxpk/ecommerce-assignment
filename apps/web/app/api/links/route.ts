import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createLinkSchema } from "shared";
import { generateShortCode, buildTargetUrl } from "@/lib/utils";

// GET /api/links - List all links
export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "10");
		const campaignId = searchParams.get("campaignId");
		const productId = searchParams.get("productId");
		const skip = (page - 1) * limit;

		const where: Record<string, string> = {};
		if (campaignId) where.campaignId = campaignId;
		if (productId) where.productId = productId;

		const [links, total] = await Promise.all([
			prisma.link.findMany({
				where,
				include: {
					product: true,
					campaign: true,
					_count: {
						select: { clicks: true },
					},
				},
				orderBy: { createdAt: "desc" },
				skip,
				take: limit,
			}),
			prisma.link.count({ where }),
		]);

		return NextResponse.json({
			success: true,
			data: links,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error("Error fetching links:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to fetch links" },
			{ status: 500 },
		);
	}
}

// POST /api/links - Generate affiliate link
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const validation = createLinkSchema.safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				{ success: false, error: validation.error.errors[0].message },
				{ status: 400 },
			);
		}

		const { productId, campaignId, marketplace } = validation.data;

		// Check if link already exists
		const existingLink = await prisma.link.findUnique({
			where: {
				productId_campaignId_marketplace: {
					productId,
					campaignId,
					marketplace,
				},
			},
		});

		if (existingLink) {
			return NextResponse.json({
				success: true,
				data: existingLink,
				message: "Link already exists",
			});
		}

		// Get product offer for this marketplace
		const offer = await prisma.offer.findUnique({
			where: {
				productId_marketplace: {
					productId,
					marketplace,
				},
			},
		});

		if (!offer) {
			return NextResponse.json(
				{
					success: false,
					error: "No offer found for this product and marketplace",
				},
				{ status: 400 },
			);
		}

		// Get campaign for UTM params
		const campaign = await prisma.campaign.findUnique({
			where: { id: campaignId },
		});

		if (!campaign) {
			return NextResponse.json(
				{ success: false, error: "Campaign not found" },
				{ status: 400 },
			);
		}

		// Generate short code and target URL
		const shortCode = generateShortCode();
		const targetUrl = buildTargetUrl(offer.originalUrl, {
			campaign: campaign.utmCampaign,
			source: campaign.utmSource || undefined,
			medium: campaign.utmMedium || undefined,
		});

		const link = await prisma.link.create({
			data: {
				shortCode,
				productId,
				campaignId,
				marketplace,
				targetUrl,
			},
			include: {
				product: true,
				campaign: true,
			},
		});

		return NextResponse.json({ success: true, data: link }, { status: 201 });
	} catch (error) {
		console.error("Error creating link:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to create link" },
			{ status: 500 },
		);
	}
}
