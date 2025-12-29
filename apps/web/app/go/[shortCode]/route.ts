import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createHash } from "crypto";

interface RouteParams {
	params: Promise<{ shortCode: string }>;
}

// GET /go/:shortCode - Redirect and track click
export async function GET(request: NextRequest, { params }: RouteParams) {
	try {
		const { shortCode } = await params;

		// Find the link
		const link = await prisma.link.findUnique({
			where: { shortCode },
			include: {
				campaign: true,
			},
		});

		if (!link) {
			return NextResponse.redirect(new URL("/404", request.url));
		}

		// Check if campaign is active
		const now = new Date();
		if (!link.campaign.isActive) {
			return NextResponse.redirect(new URL("/campaign-inactive", request.url));
		}

		if (link.campaign.startAt && now < link.campaign.startAt) {
			return NextResponse.redirect(
				new URL("/campaign-not-started", request.url),
			);
		}

		if (link.campaign.endAt && now > link.campaign.endAt) {
			return NextResponse.redirect(new URL("/campaign-ended", request.url));
		}

		// Get request metadata for tracking
		const referrer = request.headers.get("referer") || null;
		const userAgent = request.headers.get("user-agent") || null;

		// Hash IP for privacy (get from x-forwarded-for or connection)
		const ip =
			request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
		const ipHash = createHash("sha256")
			.update(ip)
			.digest("hex")
			.substring(0, 16);

		// Record the click asynchronously (don't block redirect)
		prisma.click
			.create({
				data: {
					linkId: link.id,
					referrer,
					userAgent,
					ipHash,
				},
			})
			.catch((error) => {
				console.error("Failed to record click:", error);
			});

		// Redirect to target URL
		return NextResponse.redirect(link.targetUrl, { status: 302 });
	} catch (error) {
		console.error("Error processing redirect:", error);
		return NextResponse.redirect(new URL("/error", request.url));
	}
}
