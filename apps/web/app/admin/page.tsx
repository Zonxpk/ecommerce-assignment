"use client";

import { useEffect, useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	LineChart,
	Line,
} from "recharts";
import {
	MousePointer2,
	Package,
	Megaphone,
	Link as LinkIcon,
} from "lucide-react";

interface DashboardData {
	summary: {
		totalClicks: number;
		totalProducts: number;
		totalCampaigns: number;
		totalLinks: number;
	};
	clicksByCampaign: Array<{
		campaignId: string;
		campaignName: string;
		clicks: number;
		uniqueProducts: number;
	}>;
	clicksByMarketplace: Array<{
		marketplace: string;
		clicks: number;
	}>;
	topProducts: Array<{
		linkId: string;
		productId: string;
		productTitle: string;
		productImage: string;
		clicks: number;
		marketplace: string;
	}>;
	clicksOverTime: Array<{
		date: string;
		clicks: number;
	}>;
}

const COLORS = ["#0f146d", "#ee4d2d", "#10b981", "#f59e0b"];

export default function AdminDashboard() {
	const [data, setData] = useState<DashboardData | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchDashboard();
	}, []);

	async function fetchDashboard() {
		try {
			const res = await fetch("/api/dashboard?days=30");
			const json = await res.json();
			if (json.success) {
				setData(json.data);
			}
		} catch (error) {
			console.error("Failed to fetch dashboard:", error);
		} finally {
			setLoading(false);
		}
	}

	if (loading) {
		return (
			<div className="space-y-8">
				<div>
					<h1 className="text-3xl font-bold">Dashboard</h1>
					<p className="text-muted-foreground">Analytics overview</p>
				</div>
				<div className="grid grid-cols-4 gap-4">
					{[...Array(4)].map((_, i) => (
						<Card key={i}>
							<CardHeader className="pb-2">
								<Skeleton className="h-4 w-24" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-8 w-16" />
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	if (!data) {
		return (
			<div className="text-center py-12">
				<p className="text-muted-foreground">Failed to load dashboard data</p>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-3xl font-bold">Dashboard</h1>
				<p className="text-muted-foreground">Last 30 days analytics overview</p>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-4 gap-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
						<MousePointer2 className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{data.summary.totalClicks}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Products</CardTitle>
						<Package className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{data.summary.totalProducts}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Campaigns</CardTitle>
						<Megaphone className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{data.summary.totalCampaigns}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Active Links</CardTitle>
						<LinkIcon className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{data.summary.totalLinks}</div>
					</CardContent>
				</Card>
			</div>

			{/* Charts Row */}
			<div className="grid grid-cols-2 gap-6">
				{/* Clicks Over Time */}
				<Card>
					<CardHeader>
						<CardTitle>Clicks Over Time</CardTitle>
						<CardDescription>Daily click trends</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="h-[300px]">
							<ResponsiveContainer width="100%" height="100%">
								<LineChart data={data.clicksOverTime}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis
										dataKey="date"
										tickFormatter={(value) =>
											new Date(value).toLocaleDateString("en-US", {
												month: "short",
												day: "numeric",
											})
										}
									/>
									<YAxis />
									<Tooltip
										labelFormatter={(value) =>
											new Date(value).toLocaleDateString()
										}
									/>
									<Line
										type="monotone"
										dataKey="clicks"
										stroke="#0f146d"
										strokeWidth={2}
									/>
								</LineChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>

				{/* Clicks by Marketplace */}
				<Card>
					<CardHeader>
						<CardTitle>Clicks by Marketplace</CardTitle>
						<CardDescription>Distribution across platforms</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="h-[300px]">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={data.clicksByMarketplace}
										dataKey="clicks"
										nameKey="marketplace"
										cx="50%"
										cy="50%"
										outerRadius={100}
										label={({ marketplace, clicks }) =>
											`${marketplace}: ${clicks}`
										}
									>
										{data.clicksByMarketplace.map((entry, index) => (
											<Cell
												key={`cell-${index}`}
												fill={
													entry.marketplace === "LAZADA" ? "#0f146d" : "#ee4d2d"
												}
											/>
										))}
									</Pie>
									<Tooltip />
								</PieChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Clicks by Campaign */}
			<Card>
				<CardHeader>
					<CardTitle>Clicks by Campaign</CardTitle>
					<CardDescription>Performance per campaign</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="h-[300px]">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={data.clicksByCampaign}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="campaignName" />
								<YAxis />
								<Tooltip />
								<Bar dataKey="clicks" fill="#0f146d" />
							</BarChart>
						</ResponsiveContainer>
					</div>
				</CardContent>
			</Card>

			{/* Top Products */}
			<Card>
				<CardHeader>
					<CardTitle>Top Performing Products</CardTitle>
					<CardDescription>Products with most clicks</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{data.topProducts.slice(0, 5).map((product, index) => (
							<div
								key={product.linkId}
								className="flex items-center gap-4 p-3 rounded-lg bg-gray-50"
							>
								<span className="text-lg font-bold text-muted-foreground w-6">
									#{index + 1}
								</span>
								{product.productImage && (
									<img
										src={product.productImage}
										alt={product.productTitle}
										className="w-12 h-12 object-cover rounded"
									/>
								)}
								<div className="flex-1 min-w-0">
									<p className="font-medium truncate">{product.productTitle}</p>
									<Badge
										variant={
											product.marketplace === "LAZADA" ? "lazada" : "shopee"
										}
									>
										{product.marketplace}
									</Badge>
								</div>
								<div className="text-right">
									<p className="text-2xl font-bold">{product.clicks}</p>
									<p className="text-sm text-muted-foreground">clicks</p>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
