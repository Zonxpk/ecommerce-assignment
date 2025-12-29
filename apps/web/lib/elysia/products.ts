import { Elysia, t } from "elysia";
import prisma from "@/lib/prisma";
import { fetchProductData } from "adapters";
import { createProductSchema, type Marketplace } from "shared";

export const productsRoutes = new Elysia({ prefix: "/products" })
	// GET /api/products - List all products with offers
	.get(
		"/",
		async ({ query }) => {
			try {
				const page = parseInt(query.page || "1");
				const limit = parseInt(query.limit || "10");
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

				return {
					success: true,
					data: products,
					pagination: {
						page,
						limit,
						total,
						totalPages: Math.ceil(total / limit),
					},
				};
			} catch (error) {
				console.error("Error fetching products:", error);
				return { success: false, error: "Failed to fetch products" };
			}
		},
		{
			query: t.Object({
				page: t.Optional(t.String()),
				limit: t.Optional(t.String()),
			}),
		},
	)
	// POST /api/products - Add new product
	.post(
		"/",
		async ({ body, set }) => {
			try {
				const validation = createProductSchema.safeParse(body);

				if (!validation.success) {
					set.status = 400;
					return {
						success: false,
						error: validation.error.errors[0].message,
					};
				}

				const { url, marketplace } = validation.data;

				// Fetch product data from marketplace adapter
				const result = await fetchProductData(url, marketplace as Marketplace);

				if (!result.success || !result.data) {
					set.status = 400;
					return {
						success: false,
						error: result.error || "Failed to fetch product data",
					};
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

					return {
						success: true,
						data: product,
						message: "Product already exists, price updated",
					};
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

				set.status = 201;
				return { success: true, data: product };
			} catch (error) {
				console.error("Error creating product:", error);
				set.status = 500;
				return { success: false, error: "Failed to create product" };
			}
		},
		{
			body: t.Object({
				url: t.String(),
				marketplace: t.Union([t.Literal("LAZADA"), t.Literal("SHOPEE")]),
			}),
		},
	)
	// GET /api/products/:id - Get single product
	.get(
		"/:id",
		async ({ params, set }) => {
			try {
				const product = await prisma.product.findUnique({
					where: { id: params.id },
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
					set.status = 404;
					return { success: false, error: "Product not found" };
				}

				return { success: true, data: product };
			} catch (error) {
				console.error("Error fetching product:", error);
				set.status = 500;
				return { success: false, error: "Failed to fetch product" };
			}
		},
		{
			params: t.Object({
				id: t.String(),
			}),
		},
	)
	// DELETE /api/products/:id - Delete product
	.delete(
		"/:id",
		async ({ params, set }) => {
			try {
				await prisma.product.delete({
					where: { id: params.id },
				});

				return { success: true, message: "Product deleted" };
			} catch (error) {
				console.error("Error deleting product:", error);
				set.status = 500;
				return { success: false, error: "Failed to delete product" };
			}
		},
		{
			params: t.Object({
				id: t.String(),
			}),
		},
	)
	// GET /api/products/:id/offers - Get offers for a product
	.get(
		"/:id/offers",
		async ({ params, set }) => {
			try {
				const offers = await prisma.offer.findMany({
					where: { productId: params.id },
					orderBy: { price: "asc" },
				});

				if (offers.length === 0) {
					set.status = 404;
					return { success: false, error: "No offers found for this product" };
				}

				// Find best price
				const bestPrice = offers.reduce((min, offer) =>
					Number(offer.price) < Number(min.price) ? offer : min,
				);

				return {
					success: true,
					data: {
						offers,
						bestOffer: bestPrice,
					},
				};
			} catch (error) {
				console.error("Error fetching offers:", error);
				set.status = 500;
				return { success: false, error: "Failed to fetch offers" };
			}
		},
		{
			params: t.Object({
				id: t.String(),
			}),
		},
	);
