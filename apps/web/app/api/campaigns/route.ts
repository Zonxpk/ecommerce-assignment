import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createCampaignSchema } from "shared";

// GET /api/campaigns - List all campaigns
export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "10");
		const activeOnly = searchParams.get("active") === "true";
		const skip = (page - 1) * limit;

		const where = activeOnly ? { isActive: true } : {};

		const [campaigns, total] = await Promise.all([
			prisma.campaign.findMany({
				where,
				include: {
					_count: {
						select: { links: true },
					},
				},
				orderBy: { createdAt: "desc" },
				skip,
				take: limit,
			}),
			prisma.campaign.count({ where }),
		]);

		return NextResponse.json({
			success: true,
			data: campaigns,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error("Error fetching campaigns:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to fetch campaigns" },
			{ status: 500 },
		);
	}
}

// POST /api/campaigns - Create new campaign
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const validation = createCampaignSchema.safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				{ success: false, error: validation.error.errors[0].message },
				{ status: 400 },
			);
		}

		const {
			name,
			slug,
			utmCampaign,
			utmSource,
			utmMedium,
			startAt,
			endAt,
			isActive,
		} = validation.data;

		// Check if slug already exists
		const existingCampaign = await prisma.campaign.findUnique({
			where: { slug },
		});

		if (existingCampaign) {
			return NextResponse.json(
				{ success: false, error: "Campaign with this slug already exists" },
				{ status: 400 },
			);
		}

		const campaign = await prisma.campaign.create({
			data: {
				name,
				slug,
				utmCampaign,
				utmSource,
				utmMedium,
				startAt: startAt ? new Date(startAt) : null,
				endAt: endAt ? new Date(endAt) : null,
				isActive,
			},
		});

		return NextResponse.json(
			{ success: true, data: campaign },
			{ status: 201 },
		);
	} catch (error) {
		console.error("Error creating campaign:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to create campaign" },
			{ status: 500 },
		);
	}
}
