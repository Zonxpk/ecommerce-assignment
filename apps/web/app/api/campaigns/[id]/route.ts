import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface RouteParams {
	params: Promise<{ id: string }>;
}

// GET /api/campaigns/:id - Get single campaign
export async function GET(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;

		const campaign = await prisma.campaign.findUnique({
			where: { id },
			include: {
				links: {
					include: {
						product: {
							include: { offers: true },
						},
						_count: {
							select: { clicks: true },
						},
					},
				},
			},
		});

		if (!campaign) {
			return NextResponse.json(
				{ success: false, error: "Campaign not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json({ success: true, data: campaign });
	} catch (error) {
		console.error("Error fetching campaign:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to fetch campaign" },
			{ status: 500 },
		);
	}
}

// PUT /api/campaigns/:id - Update campaign
export async function PUT(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;
		const body = await request.json();

		const campaign = await prisma.campaign.update({
			where: { id },
			data: {
				name: body.name,
				utmCampaign: body.utmCampaign,
				utmSource: body.utmSource,
				utmMedium: body.utmMedium,
				startAt: body.startAt ? new Date(body.startAt) : null,
				endAt: body.endAt ? new Date(body.endAt) : null,
				isActive: body.isActive,
			},
		});

		return NextResponse.json({ success: true, data: campaign });
	} catch (error) {
		console.error("Error updating campaign:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to update campaign" },
			{ status: 500 },
		);
	}
}

// DELETE /api/campaigns/:id - Delete campaign
export async function DELETE(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;

		await prisma.campaign.delete({
			where: { id },
		});

		return NextResponse.json({ success: true, message: "Campaign deleted" });
	} catch (error) {
		console.error("Error deleting campaign:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to delete campaign" },
			{ status: 500 },
		);
	}
}
