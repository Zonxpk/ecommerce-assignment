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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Copy, ExternalLink, MousePointer2 } from "lucide-react";

interface Link {
	id: string;
	shortCode: string;
	marketplace: "LAZADA" | "SHOPEE";
	targetUrl: string;
	createdAt: string;
	product: {
		id: string;
		title: string;
		imageUrl: string | null;
	};
	campaign: {
		id: string;
		name: string;
	};
	_count: {
		clicks: number;
	};
}

interface Product {
	id: string;
	title: string;
	offers: Array<{ marketplace: string }>;
}

interface Campaign {
	id: string;
	name: string;
	isActive: boolean;
}

export default function LinksPage() {
	const [links, setLinks] = useState<Link[]>([]);
	const [products, setProducts] = useState<Product[]>([]);
	const [campaigns, setCampaigns] = useState<Campaign[]>([]);
	const [loading, setLoading] = useState(true);
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [newLink, setNewLink] = useState({
		productId: "",
		campaignId: "",
		marketplace: "",
	});
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

	useEffect(() => {
		Promise.all([fetchLinks(), fetchProducts(), fetchCampaigns()]).finally(() =>
			setLoading(false),
		);
	}, []);

	async function fetchLinks() {
		try {
			const res = await fetch("/api/links");
			const json = await res.json();
			if (json.success) {
				setLinks(json.data);
			}
		} catch (error) {
			console.error("Failed to fetch links:", error);
		}
	}

	async function fetchProducts() {
		try {
			const res = await fetch("/api/products");
			const json = await res.json();
			if (json.success) {
				setProducts(json.data);
			}
		} catch (error) {
			console.error("Failed to fetch products:", error);
		}
	}

	async function fetchCampaigns() {
		try {
			const res = await fetch("/api/campaigns?active=true");
			const json = await res.json();
			if (json.success) {
				setCampaigns(json.data);
			}
		} catch (error) {
			console.error("Failed to fetch campaigns:", error);
		}
	}

	async function handleCreateLink(e: React.FormEvent) {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const res = await fetch("/api/links", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(newLink),
			});

			const json = await res.json();
			if (json.success) {
				setIsAddDialogOpen(false);
				setNewLink({ productId: "", campaignId: "", marketplace: "" });
				setSelectedProduct(null);
				fetchLinks();
			} else {
				alert(json.error || "Failed to create link");
			}
		} catch (error) {
			console.error("Failed to create link:", error);
			alert("Failed to create link");
		} finally {
			setIsSubmitting(false);
		}
	}

	function copyToClipboard(shortCode: string) {
		const url = `${window.location.origin}/go/${shortCode}`;
		navigator.clipboard.writeText(url);
		alert("Link copied to clipboard!");
	}

	function handleProductSelect(productId: string) {
		const product = products.find((p) => p.id === productId);
		setSelectedProduct(product || null);
		setNewLink({ ...newLink, productId, marketplace: "" });
	}

	if (loading) {
		return (
			<div className="space-y-8">
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-3xl font-bold">Affiliate Links</h1>
						<p className="text-muted-foreground">Manage affiliate links</p>
					</div>
				</div>
				<div className="grid gap-4">
					{[...Array(4)].map((_, i) => (
						<Card key={i}>
							<CardContent className="p-4">
								<div className="flex gap-4">
									<Skeleton className="w-16 h-16 rounded" />
									<div className="flex-1 space-y-2">
										<Skeleton className="h-5 w-3/4" />
										<Skeleton className="h-4 w-1/2" />
									</div>
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
					<h1 className="text-3xl font-bold">Affiliate Links</h1>
					<p className="text-muted-foreground">
						Generate and manage affiliate tracking links
					</p>
				</div>
				<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="h-4 w-4 mr-2" />
							Generate Link
						</Button>
					</DialogTrigger>
					<DialogContent>
						<form onSubmit={handleCreateLink}>
							<DialogHeader>
								<DialogTitle>Generate Affiliate Link</DialogTitle>
								<DialogDescription>
									Create a trackable affiliate link for a product campaign
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4 py-4">
								<div className="space-y-2">
									<Label>Product</Label>
									<Select
										value={newLink.productId}
										onValueChange={handleProductSelect}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select a product" />
										</SelectTrigger>
										<SelectContent>
											{products.map((product) => (
												<SelectItem key={product.id} value={product.id}>
													{product.title}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label>Campaign</Label>
									<Select
										value={newLink.campaignId}
										onValueChange={(value) =>
											setNewLink({ ...newLink, campaignId: value })
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select a campaign" />
										</SelectTrigger>
										<SelectContent>
											{campaigns.map((campaign) => (
												<SelectItem key={campaign.id} value={campaign.id}>
													{campaign.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label>Marketplace</Label>
									<Select
										value={newLink.marketplace}
										onValueChange={(value) =>
											setNewLink({ ...newLink, marketplace: value })
										}
										disabled={!selectedProduct}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select marketplace" />
										</SelectTrigger>
										<SelectContent>
											{selectedProduct?.offers.map((offer) => (
												<SelectItem
													key={offer.marketplace}
													value={offer.marketplace}
												>
													{offer.marketplace}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
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
								<Button
									type="submit"
									disabled={
										isSubmitting ||
										!newLink.productId ||
										!newLink.campaignId ||
										!newLink.marketplace
									}
								>
									{isSubmitting ? "Generating..." : "Generate Link"}
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			{links.length === 0 ? (
				<Card>
					<CardContent className="py-12 text-center">
						<p className="text-muted-foreground">
							No links yet. Generate your first affiliate link to start
							tracking.
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4">
					{links.map((link) => (
						<Card key={link.id}>
							<CardContent className="p-4">
								<div className="flex items-center gap-4">
									{link.product.imageUrl ? (
										<img
											src={link.product.imageUrl}
											alt={link.product.title}
											className="w-16 h-16 object-cover rounded-lg"
										/>
									) : (
										<div className="w-16 h-16 bg-gray-100 rounded-lg" />
									)}
									<div className="flex-1 min-w-0">
										<h3 className="font-medium truncate">
											{link.product.title}
										</h3>
										<div className="flex items-center gap-2 mt-1">
											<Badge
												variant={
													link.marketplace === "LAZADA" ? "lazada" : "shopee"
												}
											>
												{link.marketplace}
											</Badge>
											<span className="text-sm text-muted-foreground">
												{link.campaign.name}
											</span>
										</div>
										<div className="flex items-center gap-2 mt-2">
											<code className="bg-gray-100 px-2 py-1 rounded text-sm">
												/go/{link.shortCode}
											</code>
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8"
												onClick={() => copyToClipboard(link.shortCode)}
											>
												<Copy className="h-4 w-4" />
											</Button>
											<a
												href={`/go/${link.shortCode}`}
												target="_blank"
												rel="noopener noreferrer"
											>
												<Button variant="ghost" size="icon" className="h-8 w-8">
													<ExternalLink className="h-4 w-4" />
												</Button>
											</a>
										</div>
									</div>
									<div className="text-right">
										<div className="flex items-center gap-2 text-2xl font-bold">
											<MousePointer2 className="h-5 w-5 text-muted-foreground" />
											{link._count.clicks}
										</div>
										<p className="text-sm text-muted-foreground">clicks</p>
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
