"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
import { Plus, Trash2, ExternalLink, Award } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Offer {
	id: string;
	marketplace: "LAZADA" | "SHOPEE";
	storeName: string;
	price: string;
	originalUrl: string;
	lastCheckedAt: string;
}

interface Product {
	id: string;
	title: string;
	imageUrl: string | null;
	offers: Offer[];
	_count: {
		links: number;
	};
}

export default function ProductsPage() {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [newProduct, setNewProduct] = useState({
		url: "",
		marketplace: "LAZADA",
	});

	useEffect(() => {
		fetchProducts();
	}, []);

	async function fetchProducts() {
		try {
			const res = await fetch("/api/products");
			const json = await res.json();
			if (json.success) {
				setProducts(json.data);
			}
		} catch (error) {
			console.error("Failed to fetch products:", error);
		} finally {
			setLoading(false);
		}
	}

	async function handleAddProduct(e: React.FormEvent) {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const res = await fetch("/api/products", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(newProduct),
			});

			const json = await res.json();
			if (json.success) {
				setIsAddDialogOpen(false);
				setNewProduct({ url: "", marketplace: "LAZADA" });
				fetchProducts();
			} else {
				alert(json.error || "Failed to add product");
			}
		} catch (error) {
			console.error("Failed to add product:", error);
			alert("Failed to add product");
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleDeleteProduct(id: string) {
		if (!confirm("Are you sure you want to delete this product?")) return;

		try {
			const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
			const json = await res.json();
			if (json.success) {
				fetchProducts();
			}
		} catch (error) {
			console.error("Failed to delete product:", error);
		}
	}

	function getBestOffer(offers: Offer[]): Offer | null {
		if (offers.length === 0) return null;
		return offers.reduce((min, offer) =>
			parseFloat(offer.price) < parseFloat(min.price) ? offer : min,
		);
	}

	if (loading) {
		return (
			<div className="space-y-8">
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-3xl font-bold">Products</h1>
						<p className="text-muted-foreground">Manage product catalog</p>
					</div>
				</div>
				<div className="grid grid-cols-2 gap-6">
					{[...Array(4)].map((_, i) => (
						<Card key={i}>
							<CardContent className="p-6">
								<div className="flex gap-4">
									<Skeleton className="w-24 h-24 rounded" />
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
					<h1 className="text-3xl font-bold">Products</h1>
					<p className="text-muted-foreground">
						Manage product catalog and price comparison
					</p>
				</div>
				<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="h-4 w-4 mr-2" />
							Add Product
						</Button>
					</DialogTrigger>
					<DialogContent>
						<form onSubmit={handleAddProduct}>
							<DialogHeader>
								<DialogTitle>Add New Product</DialogTitle>
								<DialogDescription>
									Enter a Lazada or Shopee product URL to fetch product details
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4 py-4">
								<div className="space-y-2">
									<Label htmlFor="marketplace">Marketplace</Label>
									<Select
										value={newProduct.marketplace}
										onValueChange={(value) =>
											setNewProduct({ ...newProduct, marketplace: value })
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select marketplace" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="LAZADA">Lazada</SelectItem>
											<SelectItem value="SHOPEE">Shopee</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label htmlFor="url">Product URL</Label>
									<Input
										id="url"
										placeholder={
											newProduct.marketplace === "LAZADA"
												? "https://www.lazada.co.th/products/..."
												: "https://shopee.co.th/product/..."
										}
										value={newProduct.url}
										onChange={(e) =>
											setNewProduct({ ...newProduct, url: e.target.value })
										}
										required
									/>
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
									{isSubmitting ? "Adding..." : "Add Product"}
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			{products.length === 0 ? (
				<Card>
					<CardContent className="py-12 text-center">
						<p className="text-muted-foreground">
							No products yet. Add your first product to get started.
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="grid grid-cols-2 gap-6">
					{products.map((product) => {
						const bestOffer = getBestOffer(product.offers);
						return (
							<Card key={product.id} className="overflow-hidden">
								<CardContent className="p-6">
									<div className="flex gap-4">
										{product.imageUrl ? (
											<img
												src={product.imageUrl}
												alt={product.title}
												className="w-24 h-24 object-cover rounded-lg"
											/>
										) : (
											<div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
												<span className="text-gray-400">No image</span>
											</div>
										)}
										<div className="flex-1 min-w-0">
											<h3 className="font-semibold text-lg truncate">
												{product.title}
											</h3>
											<div className="mt-2 space-y-2">
												{product.offers.map((offer) => (
													<div
														key={offer.id}
														className="flex items-center gap-2"
													>
														<Badge
															variant={
																offer.marketplace === "LAZADA"
																	? "lazada"
																	: "shopee"
															}
														>
															{offer.marketplace}
														</Badge>
														<span className="font-medium">
															{formatPrice(offer.price)}
														</span>
														{bestOffer?.id === offer.id && (
															<Badge variant="success" className="gap-1">
																<Award className="h-3 w-3" />
																Best Price
															</Badge>
														)}
													</div>
												))}
											</div>
											<p className="text-sm text-muted-foreground mt-2">
												{product._count.links} affiliate links
											</p>
										</div>
										<div className="flex flex-col gap-2">
											<Button
												variant="outline"
												size="icon"
												onClick={() => handleDeleteProduct(product.id)}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}
		</div>
	);
}
