import { Elysia, t } from "elysia";
import prisma from "@/lib/prisma";
import { createLinkSchema } from "shared";
import { generateShortCode, buildTargetUrl } from "@/lib/utils";

export const linksRoutes = new Elysia({ prefix: "/links" })
	// GET /api/links - List all links
	.get(
		"/",
		async ({ query }) => {
			try {
				const page = parseInt(query.page || "1");
				const limit = parseInt(query.limit || "10");
				const { campaignId, productId } = query;
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

				return {
					success: true,
					data: links,
					pagination: {
						page,
						limit,
						total,
						totalPages: Math.ceil(total / limit),
					},
				};
			} catch (error) {
				console.error("Error fetching links:", error);
				return { success: false, error: "Failed to fetch links" };
			}
		},
		{
			query: t.Object({
				page: t.Optional(t.String()),
				limit: t.Optional(t.String()),
				campaignId: t.Optional(t.String()),
				productId: t.Optional(t.String()),
			}),
		},
	)
	// POST /api/links - Generate affiliate link
	.post(
		"/",
		async ({ body, set }) => {
			try {
				const validation = createLinkSchema.safeParse(body);

				if (!validation.success) {
					set.status = 400;
					return {
						success: false,
						error: validation.error.errors[0].message,
					};
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
					return {
						success: true,
						data: existingLink,
						message: "Link already exists",
					};
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
					set.status = 400;
					return {
						success: false,
						error: "No offer found for this product and marketplace",
					};
				}

				// Get campaign for UTM params
				const campaign = await prisma.campaign.findUnique({
					where: { id: campaignId },
				});

				if (!campaign) {
					set.status = 400;
					return { success: false, error: "Campaign not found" };
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

				set.status = 201;
				return { success: true, data: link };
			} catch (error) {
				console.error("Error creating link:", error);
				set.status = 500;
				return { success: false, error: "Failed to create link" };
			}
		},
		{
			body: t.Object({
				productId: t.String(),
				campaignId: t.String(),
				marketplace: t.Union([t.Literal("LAZADA"), t.Literal("SHOPEE")]),
			}),
		},
	);
