"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Edit, Calendar, Link as LinkIcon } from "lucide-react";
import { format } from "date-fns";

interface Campaign {
	id: string;
	name: string;
	slug: string;
	utmCampaign: string;
	utmSource: string | null;
	utmMedium: string | null;
	startAt: string | null;
	endAt: string | null;
	isActive: boolean;
	_count: {
		links: number;
	};
}

export default function CampaignsPage() {
	const [campaigns, setCampaigns] = useState<Campaign[]>([]);
	const [loading, setLoading] = useState(true);
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [newCampaign, setNewCampaign] = useState({
		name: "",
		slug: "",
		utmCampaign: "",
		utmSource: "affiliate",
		utmMedium: "web",
		startAt: "",
		endAt: "",
		isActive: true,
	});

	useEffect(() => {
		fetchCampaigns();
	}, []);

	async function fetchCampaigns() {
		try {
			const res = await fetch("/api/campaigns");
			const json = await res.json();
			if (json.success) {
				setCampaigns(json.data);
			}
		} catch (error) {
			console.error("Failed to fetch campaigns:", error);
		} finally {
			setLoading(false);
		}
	}

	function generateSlug(name: string): string {
		return name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-|-$/g, "");
	}

	async function handleAddCampaign(e: React.FormEvent) {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const res = await fetch("/api/campaigns", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(newCampaign),
			});

			const json = await res.json();
			if (json.success) {
				setIsAddDialogOpen(false);
				setNewCampaign({
					name: "",
					slug: "",
					utmCampaign: "",
					utmSource: "affiliate",
					utmMedium: "web",
					startAt: "",
					endAt: "",
					isActive: true,
				});
				fetchCampaigns();
			} else {
				alert(json.error || "Failed to create campaign");
			}
		} catch (error) {
			console.error("Failed to create campaign:", error);
			alert("Failed to create campaign");
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleDeleteCampaign(id: string) {
		if (!confirm("Are you sure you want to delete this campaign?")) return;

		try {
			const res = await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
			const json = await res.json();
			if (json.success) {
				fetchCampaigns();
			}
		} catch (error) {
			console.error("Failed to delete campaign:", error);
		}
	}

	async function toggleCampaignStatus(campaign: Campaign) {
		try {
			const res = await fetch(`/api/campaigns/${campaign.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ...campaign, isActive: !campaign.isActive }),
			});
			const json = await res.json();
			if (json.success) {
				fetchCampaigns();
			}
		} catch (error) {
			console.error("Failed to update campaign:", error);
		}
	}

	if (loading) {
		return (
			<div className="space-y-8">
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-3xl font-bold">Campaigns</h1>
						<p className="text-muted-foreground">Manage marketing campaigns</p>
					</div>
				</div>
				<div className="grid gap-4">
					{[...Array(3)].map((_, i) => (
						<Card key={i}>
							<CardContent className="p-6">
								<div className="flex justify-between">
									<div className="space-y-2">
										<Skeleton className="h-6 w-48" />
										<Skeleton className="h-4 w-32" />
									</div>
									<Skeleton className="h-8 w-20" />
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold">Campaigns</h1>
					<p className="text-muted-foreground">
						Manage marketing campaigns and UTM tracking
					</p>
				</div>
				<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="h-4 w-4 mr-2" />
							Create Campaign
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-md">
						<form onSubmit={handleAddCampaign}>
							<DialogHeader>
								<DialogTitle>Create New Campaign</DialogTitle>
								<DialogDescription>
									Set up a new marketing campaign with UTM parameters
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4 py-4">
								<div className="space-y-2">
									<Label htmlFor="name">Campaign Name</Label>
									<Input
										id="name"
										placeholder="Summer Sale 2025"
										value={newCampaign.name}
										onChange={(e) => {
											const name = e.target.value;
											setNewCampaign({
												...newCampaign,
												name,
												slug: generateSlug(name),
												utmCampaign: generateSlug(name),
											});
										}}
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="slug">URL Slug</Label>
									<Input
										id="slug"
										placeholder="summer-sale-2025"
										value={newCampaign.slug}
										onChange={(e) =>
											setNewCampaign({ ...newCampaign, slug: e.target.value })
										}
										required
									/>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="utmSource">UTM Source</Label>
										<Input
											id="utmSource"
											placeholder="affiliate"
											value={newCampaign.utmSource}
											onChange={(e) =>
												setNewCampaign({
													...newCampaign,
													utmSource: e.target.value,
												})
											}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="utmMedium">UTM Medium</Label>
										<Input
											id="utmMedium"
											placeholder="web"
											value={newCampaign.utmMedium}
											onChange={(e) =>
												setNewCampaign({
													...newCampaign,
													utmMedium: e.target.value,
												})
											}
										/>
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="startAt">Start Date</Label>
										<Input
											id="startAt"
											type="date"
											value={newCampaign.startAt}
											onChange={(e) =>
												setNewCampaign({
													...newCampaign,
													startAt: e.target.value,
												})
											}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="endAt">End Date</Label>
										<Input
											id="endAt"
											type="date"
											value={newCampaign.endAt}
											onChange={(e) =>
												setNewCampaign({
													...newCampaign,
													endAt: e.target.value,
												})
											}
										/>
									</div>
								</div>
							</div>
							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={() => setIsAddDialogOpen(false)}
								>
									Cancel
								</Button>
								<Button type="submit" disabled={isSubmitting}>
									{isSubmitting ? "Creating..." : "Create Campaign"}
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			{campaigns.length === 0 ? (
				<Card>
					<CardContent className="py-12 text-center">
						<p className="text-muted-foreground">
							No campaigns yet. Create your first campaign to start tracking
							affiliate links.
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4">
					{campaigns.map((campaign) => (
						<Card key={campaign.id}>
							<CardContent className="p-6">
								<div className="flex justify-between items-start">
									<div className="space-y-2">
										<div className="flex items-center gap-3">
											<h3 className="text-xl font-semibold">{campaign.name}</h3>
											<Badge
												variant={campaign.isActive ? "success" : "secondary"}
											>
												{campaign.isActive ? "Active" : "Inactive"}
											</Badge>
										</div>
										<p className="text-sm text-muted-foreground">
											Slug:{" "}
											<code className="bg-gray-100 px-1 rounded">
												{campaign.slug}
											</code>
										</p>
										<div className="flex flex-wrap gap-2 text-sm">
											<span className="bg-gray-100 px-2 py-1 rounded">
												utm_campaign={campaign.utmCampaign}
											</span>
											{campaign.utmSource && (
												<span className="bg-gray-100 px-2 py-1 rounded">
													utm_source={campaign.utmSource}
												</span>
											)}
											{campaign.utmMedium && (
												<span className="bg-gray-100 px-2 py-1 rounded">
													utm_medium={campaign.utmMedium}
												</span>
											)}
										</div>
										<div className="flex items-center gap-4 text-sm text-muted-foreground">
											{(campaign.startAt || campaign.endAt) && (
												<span className="flex items-center gap-1">
													<Calendar className="h-4 w-4" />
													{campaign.startAt &&
														format(new Date(campaign.startAt), "MMM d, yyyy")}
													{campaign.startAt && campaign.endAt && " - "}
													{campaign.endAt &&
														format(new Date(campaign.endAt), "MMM d, yyyy")}
												</span>
											)}
											<span className="flex items-center gap-1">
												<LinkIcon className="h-4 w-4" />
												{campaign._count.links} links
											</span>
										</div>
									</div>
									<div className="flex gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => toggleCampaignStatus(campaign)}
										>
											{campaign.isActive ? "Deactivate" : "Activate"}
										</Button>
										<Button
											variant="outline"
											size="icon"
											onClick={() => handleDeleteCampaign(campaign.id)}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
