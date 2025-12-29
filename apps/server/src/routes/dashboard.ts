import { Router, Request, Response } from "express";
import prisma from "@packages/db";
import { asyncHandler, validateRequest } from "../middleware/index";
import { z } from "zod";
import { sendResponse } from "../types/response";

const router = Router();

// GET /api/dashboard - Get analytics data
router.get(
	"/",
	asyncHandler(async (req: Request, res: Response) => {
		const { days = 30, campaignId } = req.query;
		const daysNum = parseInt(days as string) || 30;

		const startDate = new Date();
		startDate.setDate(startDate.getDate() - daysNum);

		// Base click filter
		const clickFilter: Record<string, unknown> = {
			timestamp: { gte: startDate },
		};

		if (campaignId) {
			clickFilter.link = { campaignId };
		}

		// Get total clicks
		const totalClicks = await prisma.click.count({
			where: clickFilter,
		});

		// Get clicks by campaign
		const clicksByCampaign = await prisma.click.groupBy({
			by: ["linkId"],
			where: clickFilter,
			_count: true,
		});

		// Get link details for campaign breakdown
		const linkIds = clicksByCampaign.map((c: { linkId: string }) => c.linkId);
		const links = await prisma.link.findMany({
			where: { id: { in: linkIds } },
			include: { campaign: true, product: true },
		});

		// Aggregate by campaign
		const campaignStats = new Map<
			string,
			{ name: string; clicks: number; products: Set<string> }
		>();

		for (const click of clicksByCampaign) {
			const link = links.find((l: { id: string }) => l.id === click.linkId);
			if (link) {
				const existing = campaignStats.get(link.campaignId);
				if (existing) {
					existing.clicks += click._count;
					existing.products.add(link.productId);
				} else {
					campaignStats.set(link.campaignId, {
						name: link.campaign.name,
						clicks: click._count,
						products: new Set([link.productId]),
					});
				}
			}
		}

		// Get clicks by marketplace
		const marketplaceClicks = await prisma.click.findMany({
			where: clickFilter,
			include: {
				link: {
					select: { marketplace: true },
				},
			},
		});

		const clicksByMarketplaceMap = new Map<string, number>();
		for (const click of marketplaceClicks) {
			const mp = click.link.marketplace;
			clicksByMarketplaceMap.set(mp, (clicksByMarketplaceMap.get(mp) || 0) + 1);
		}

		const clicksByMarketplace = Array.from(
			clicksByMarketplaceMap.entries(),
		).map(([marketplace, clicks]) => ({ marketplace, clicks }));

		// Get top products by clicks
		const topProducts = await prisma.link.findMany({
			include: {
				product: {
					include: { offers: true },
				},
				_count: {
					select: { clicks: true },
				},
			},
			orderBy: {
				clicks: { _count: "desc" },
			},
			take: 10,
		});

		// Get clicks over time (daily)
		const clicksOverTime = await prisma.$queryRaw<
			Array<{ date: Date; count: bigint }>
		>`
      SELECT DATE(timestamp) as date, COUNT(*) as count
      FROM clicks
      WHERE timestamp >= ${startDate}
      GROUP BY DATE(timestamp)
      ORDER BY date ASC
    `;

		// Calculate totals
		const [totalProducts, totalCampaigns, totalLinks] = await Promise.all([
			prisma.product.count(),
			prisma.campaign.count({ where: { isActive: true } }),
			prisma.link.count(),
		]);

		return sendResponse(res, 200, {
			summary: {
				totalClicks,
				totalProducts,
				totalCampaigns,
				totalLinks,
			},
			clicksByCampaign: Array.from(campaignStats.entries()).map(
				([id, stats]) => ({
					campaignId: id,
					campaignName: stats.name,
					clicks: stats.clicks,
					uniqueProducts: stats.products.size,
				}),
			),
			clicksByMarketplace,
			topProducts: topProducts.map(
				(link: {
					id: string;
					product: { id: string; title: string; imageUrl: string | null };
					_count: { clicks: number };
					marketplace: string;
				}) => ({
					linkId: link.id,
					productId: link.product.id,
					productTitle: link.product.title,
					productImage: link.product.imageUrl,
					clicks: link._count.clicks,
					marketplace: link.marketplace,
				}),
			),
			clicksOverTime: clicksOverTime.map(
				(row: { date: Date; count: bigint }) => ({
					date:
						row.date instanceof Date
							? row.date.toISOString().split("T")[0]
							: String(row.date),
					clicks: Number(row.count),
				}),
			),
		});
	}),
);

export default router;
