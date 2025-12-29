import { Elysia, t } from "elysia";
import prisma from "@/lib/prisma";
import { createCampaignSchema } from "shared";

export const campaignsRoutes = new Elysia({ prefix: "/campaigns" })
	// GET /api/campaigns - List all campaigns
	.get(
		"/",
		async ({ query }) => {
			try {
				const page = parseInt(query.page || "1");
				const limit = parseInt(query.limit || "10");
				const activeOnly = query.active === "true";
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

				return {
					success: true,
					data: campaigns,
					pagination: {
						page,
						limit,
						total,
						totalPages: Math.ceil(total / limit),
					},
				};
			} catch (error) {
				console.error("Error fetching campaigns:", error);
				return { success: false, error: "Failed to fetch campaigns" };
			}
		},
		{
			query: t.Object({
				page: t.Optional(t.String()),
				limit: t.Optional(t.String()),
				active: t.Optional(t.String()),
			}),
		},
	)
	// POST /api/campaigns - Create new campaign
	.post(
		"/",
		async ({ body, set }) => {
			try {
				const validation = createCampaignSchema.safeParse(body);

				if (!validation.success) {
					set.status = 400;
					return {
						success: false,
						error: validation.error.errors[0].message,
					};
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
					set.status = 400;
					return {
						success: false,
						error: "Campaign with this slug already exists",
					};
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

				set.status = 201;
				return { success: true, data: campaign };
			} catch (error) {
				console.error("Error creating campaign:", error);
				set.status = 500;
				return { success: false, error: "Failed to create campaign" };
			}
		},
		{
			body: t.Object({
				name: t.String(),
				slug: t.String(),
				utmCampaign: t.String(),
				utmSource: t.Optional(t.String()),
				utmMedium: t.Optional(t.String()),
				startAt: t.Optional(t.String()),
				endAt: t.Optional(t.String()),
				isActive: t.Optional(t.Boolean()),
			}),
		},
	)
	// GET /api/campaigns/:id - Get single campaign
	.get(
		"/:id",
		async ({ params, set }) => {
			try {
				const campaign = await prisma.campaign.findUnique({
					where: { id: params.id },
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
					set.status = 404;
					return { success: false, error: "Campaign not found" };
				}

				return { success: true, data: campaign };
			} catch (error) {
				console.error("Error fetching campaign:", error);
				set.status = 500;
				return { success: false, error: "Failed to fetch campaign" };
			}
		},
		{
			params: t.Object({
				id: t.String(),
			}),
		},
	)
	// PUT /api/campaigns/:id - Update campaign
	.put(
		"/:id",
		async ({ params, body, set }) => {
			try {
				const campaign = await prisma.campaign.update({
					where: { id: params.id },
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

				return { success: true, data: campaign };
			} catch (error) {
				console.error("Error updating campaign:", error);
				set.status = 500;
				return { success: false, error: "Failed to update campaign" };
			}
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			body: t.Object({
				name: t.Optional(t.String()),
				utmCampaign: t.Optional(t.String()),
				utmSource: t.Optional(t.String()),
				utmMedium: t.Optional(t.String()),
				startAt: t.Optional(t.String()),
				endAt: t.Optional(t.String()),
				isActive: t.Optional(t.Boolean()),
			}),
		},
	)
	// DELETE /api/campaigns/:id - Delete campaign
	.delete(
		"/:id",
		async ({ params, set }) => {
			try {
				await prisma.campaign.delete({
					where: { id: params.id },
				});

				return { success: true, message: "Campaign deleted" };
			} catch (error) {
				console.error("Error deleting campaign:", error);
				set.status = 500;
				return { success: false, error: "Failed to delete campaign" };
			}
		},
		{
			params: t.Object({
				id: t.String(),
			}),
		},
	);
