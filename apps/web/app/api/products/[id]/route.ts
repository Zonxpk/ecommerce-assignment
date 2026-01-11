import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface RouteParams {
	params: Promise<{ id: string }>;
}

// GET /api/products/:id - Get single product
export async function GET(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;

		const product = await prisma.product.findUnique({
			where: { id },
			include: {
				offers: {
					orderBy: { price: "asc" },
				},
				links: {
					include: {
						campaign: true,
						_count: {
							select: { clicks: true },
						},
					},
				},
			},
		});

		if (!product) {
			return NextResponse.json(
				{ success: false, error: "Product not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json({ success: true, data: product });
	} catch (error) {
		console.error("Error fetching product:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to fetch product" },
			{ status: 500 },
		);
	}
}

// DELETE /api/products/:id - Delete product
export async function DELETE(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;

		await prisma.product.delete({
			where: { id },
		});

		return NextResponse.json({ success: true, message: "Product deleted" });
	} catch (error) {
		console.error("Error deleting product:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to delete product" },
			{ status: 500 },
		);
	}
}
