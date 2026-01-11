import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { fetchProductData } from "adapters";
import { createProductSchema, Marketplace } from "shared";

// GET /api/products - List all products with offers
export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "10");
		const skip = (page - 1) * limit;

		const [products, total] = await Promise.all([
			prisma.product.findMany({
				include: {
					offers: {
						orderBy: { price: "asc" },
					},
					_count: {
						select: { links: true },
					},
				},
				orderBy: { createdAt: "desc" },
				skip,
				take: limit,
			}),
			prisma.product.count(),
		]);

		return NextResponse.json({
			success: true,
			data: products,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error("Error fetching products:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to fetch products" },
			{ status: 500 },
		);
	}
}

// POST /api/products - Add new product
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const validation = createProductSchema.safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				{ success: false, error: validation.error.errors[0].message },
				{ status: 400 },
			);
		}

		const { url, marketplace } = validation.data;

		// Fetch product data from marketplace adapter
		const result = await fetchProductData(url, marketplace as Marketplace);

		if (!result.success || !result.data) {
			return NextResponse.json(
				{
					success: false,
					error: result.error || "Failed to fetch product data",
				},
				{ status: 400 },
			);
		}

		const productData = result.data;

		// Check if product with same URL already exists
		const existingOffer = await prisma.offer.findFirst({
			where: { originalUrl: url },
			include: { product: true },
		});

		if (existingOffer) {
			// Update existing offer price
			await prisma.offer.update({
				where: { id: existingOffer.id },
				data: {
					price: productData.price,
					lastCheckedAt: new Date(),
				},
			});

			const product = await prisma.product.findUnique({
				where: { id: existingOffer.productId },
				include: { offers: true },
			});

			return NextResponse.json({
				success: true,
				data: product,
				message: "Product already exists, price updated",
			});
		}

		// Create new product with offer
		const product = await prisma.product.create({
			data: {
				title: productData.title,
				imageUrl: productData.imageUrl,
				offers: {
					create: {
						marketplace: productData.marketplace,
						storeName: productData.storeName,
						price: productData.price,
						originalUrl: url,
					},
				},
			},
			include: {
				offers: true,
			},
		});

		return NextResponse.json({ success: true, data: product }, { status: 201 });
	} catch (error) {
		console.error("Error creating product:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to create product" },
			{ status: 500 },
		);
	}
}
