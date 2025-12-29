import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { Award, ExternalLink, BarChart3 } from "lucide-react";

interface PageProps {
	params: Promise<{ slug: string }>;
}

export default async function CampaignPage({ params }: PageProps) {
	const { slug } = await params;

	const campaign = await prisma.campaign.findUnique({
		where: { slug },
		include: {
			links: {
				include: {
					product: {
						include: {
							offers: {
								orderBy: { price: "asc" },
							},
						},
					},
				},
			},
		},
	});

	if (!campaign) {
		notFound();
	}

	// Group links by product
	const productMap = new Map<
		string,
		{
			product: (typeof campaign.links)[0]["product"];
			links: typeof campaign.links;
		}
	>();

	for (const link of campaign.links) {
		const existing = productMap.get(link.productId);
		if (existing) {
			existing.links.push(link);
		} else {
			productMap.set(link.productId, {
				product: link.product,
				links: [link],
			});
		}
	}

	const products = Array.from(productMap.values());

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<header className="bg-white border-b sticky top-0 z-50">
				<div className="container mx-auto px-4 py-4 flex justify-between items-center">
					<Link href="/" className="flex items-center gap-2">
						<BarChart3 className="h-6 w-6 text-primary" />
						<span className="font-bold text-lg">Affiliate Platform</span>
					</Link>
				</div>
			</header>

			{/* Campaign Header */}
			<section className="bg-gradient-to-r from-primary to-primary/80 text-white py-12">
				<div className="container mx-auto px-4">
					<Badge variant="secondary" className="mb-4">
						Special Promotion
					</Badge>
					<h1 className="text-4xl font-bold mb-2">{campaign.name}</h1>
					<p className="text-lg opacity-90">
						Compare prices and find the best deals across Lazada & Shopee
					</p>
				</div>
			</section>

			{/* Products */}
			<section className="container mx-auto px-4 py-12">
				{products.length === 0 ? (
					<div className="text-center py-12">
						<p className="text-muted-foreground">
							No products in this campaign yet.
						</p>
					</div>
				) : (
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
						{products.map(({ product, links }) => {
							const bestOffer = product.offers[0]; // Already sorted by price

							return (
								<Card key={product.id} className="overflow-hidden">
									{/* Product Image */}
									<div className="aspect-square relative bg-gray-100">
										{product.imageUrl ? (
											<img
												src={product.imageUrl}
												alt={product.title}
												className="w-full h-full object-cover"
											/>
										) : (
											<div className="w-full h-full flex items-center justify-center text-gray-400">
												No Image
											</div>
										)}
										{bestOffer && (
											<div className="absolute top-3 right-3">
												<Badge variant="success" className="gap-1">
													<Award className="h-3 w-3" />
													Best: {formatPrice(bestOffer.price)}
												</Badge>
											</div>
										)}
									</div>

									<CardContent className="p-4">
										<h3 className="font-semibold text-lg mb-3 line-clamp-2">
											{product.title}
										</h3>

										{/* Price Comparison */}
										<div className="space-y-3 mb-4">
											{product.offers.map((offer) => (
												<div
													key={offer.id}
													className="flex justify-between items-center"
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
													<span
														className={`font-bold text-lg ${
															offer.id === bestOffer?.id
																? "text-green-600"
																: "text-gray-700"
														}`}
													>
														{formatPrice(offer.price)}
													</span>
												</div>
											))}
										</div>

										{/* Buy Buttons */}
										<div className="grid grid-cols-2 gap-2">
											{links.map((link) => (
												<a
													key={link.id}
													href={`/go/${link.shortCode}`}
													target="_blank"
													rel="noopener noreferrer"
												>
													<Button
														variant={
															link.marketplace === "LAZADA"
																? "lazada"
																: "shopee"
														}
														className="w-full"
														size="sm"
													>
														Buy on {link.marketplace}
														<ExternalLink className="h-3 w-3 ml-1" />
													</Button>
												</a>
											))}
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>
				)}
			</section>

			{/* Footer */}
			<footer className="border-t bg-white py-8 mt-12">
				<div className="container mx-auto px-4 text-center text-muted-foreground">
					<p>Prices are fetched from marketplace APIs and may vary.</p>
					<p className="mt-2">
						<Link href="/" className="underline">
							Back to Home
						</Link>
					</p>
				</div>
			</footer>
		</div>
	);
}
