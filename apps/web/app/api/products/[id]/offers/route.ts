import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface RouteParams {
	params: Promise<{ id: string }>;
}

// GET /api/products/:id/offers - Get offers for a product
export async function GET(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;

		const offers = await prisma.offer.findMany({
			where: { productId: id },
			orderBy: { price: "asc" },
		});

		if (offers.length === 0) {
			return NextResponse.json(
				{ success: false, error: "No offers found for this product" },
				{ status: 404 },
			);
		}

		// Find best price
		const bestPrice = offers.reduce((min, offer) =>
			Number(offer.price) < Number(min.price) ? offer : min,
		);

		return NextResponse.json({
			success: true,
			data: {
				offers,
				bestOffer: bestPrice,
			},
		});
	} catch (error) {
		console.error("Error fetching offers:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to fetch offers" },
			{ status: 500 },
		);
	}
}
