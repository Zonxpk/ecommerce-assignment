import { Router, Request, Response } from "express";
import prisma from "@packages/db";
import { fetchProductData } from "adapters";
import { asyncHandler } from "../middleware/index";
import { sendResponse } from "../types/response";
import { z } from "zod";
import { createProductSchema, Marketplace } from "shared";

const router = Router();

// GET /api/products - List all products with offers
router.get(
	"/",
	asyncHandler(async (req: Request, res: Response) => {
		const page = parseInt((req.query.page as string) || "1");
		const limit = parseInt((req.query.limit as string) || "10");
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

		return sendResponse(res, 200, {
			products,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		});
	}),
);

// POST /api/products - Add new product
router.post(
	"/",
	asyncHandler(async (req: Request, res: Response) => {
		const validation = createProductSchema.safeParse(req.body);

		if (!validation.success) {
			return sendResponse(
				res,
				400,
				undefined,
				validation.error.errors[0].message,
			);
		}

		const { url, marketplace } = validation.data;

		// Fetch product data from marketplace adapter
		const result = await fetchProductData(url, marketplace as Marketplace);

		if (!result.success || !result.data) {
			return sendResponse(
				res,
				400,
				undefined,
				result.error || "Failed to fetch product data",
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

			return sendResponse(res, 200, {
				isNew: false,
				product,
			});
		}

		// Create new product
		const product = await prisma.product.create({
			data: {
				title: productData.title,
				imageUrl: productData.imageUrl,
				offers: {
					create: {
						originalUrl: url,
						marketplace: marketplace as Marketplace,
						storeName: productData.storeName,
						price: productData.price,
						lastCheckedAt: new Date(),
					},
				},
			},
			include: { offers: true },
		});

		return sendResponse(res, 201, {
			isNew: true,
			product,
		});
	}),
);

// GET /api/products/:id - Get product details
router.get(
	"/:id",
	asyncHandler(async (req: Request, res: Response) => {
		const product = await prisma.product.findUnique({
			where: { id: req.params.id },
			include: {
				offers: true,
				_count: {
					select: { links: true },
				},
			},
		});

		if (!product) {
			return sendResponse(res, 404, undefined, "Product not found");
		}

		return sendResponse(res, 200, product);
	}),
);

// DELETE /api/products/:id - Delete product
router.delete(
	"/:id",
	asyncHandler(async (req: Request, res: Response) => {
		const product = await prisma.product.findUnique({
			where: { id: req.params.id },
		});

		if (!product) {
			return sendResponse(res, 404, undefined, "Product not found");
		}

		await prisma.product.delete({
			where: { id: req.params.id },
		});

		return sendResponse(res, 200, {
			message: "Product deleted successfully",
			productId: req.params.id,
		});
	}),
);

// GET /api/products/:id/offers - Get product offers
router.get(
	"/:id/offers",
	asyncHandler(async (req: Request, res: Response) => {
		const product = await prisma.product.findUnique({
			where: { id: req.params.id },
			include: { offers: true },
		});

		if (!product) {
			return sendResponse(res, 404, undefined, "Product not found");
		}

		return sendResponse(res, 200, {
			productId: product.id,
			offers: product.offers,
		});
	}),
);

export default router;
