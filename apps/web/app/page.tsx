import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	BarChart3,
	Package,
	Megaphone,
	TrendingUp,
	ArrowRight,
} from "lucide-react";

export default function HomePage() {
	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
			{/* Header */}
			<header className="border-b bg-white">
				<div className="container mx-auto px-4 py-4 flex justify-between items-center">
					<div className="flex items-center gap-2">
						<BarChart3 className="h-8 w-8 text-primary" />
						<span className="font-bold text-xl">Affiliate Platform</span>
					</div>
					<Link href="/admin">
						<Button>Admin Dashboard</Button>
					</Link>
				</div>
			</header>

			{/* Hero */}
			<section className="container mx-auto px-4 py-20 text-center">
				<Badge className="mb-4" variant="secondary">
					Lazada & Shopee Price Comparison
				</Badge>
				<h1 className="text-5xl font-bold tracking-tight mb-6">
					Compare Prices. <br />
					<span className="text-primary">Earn More.</span>
				</h1>
				<p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
					Find the best deals across Lazada and Shopee. Create affiliate
					campaigns, generate tracking links, and maximize your earnings.
				</p>
				<div className="flex gap-4 justify-center">
					<Link href="/campaign/summer-deal-2025">
						<Button size="lg">
							View Sample Campaign
							<ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</Link>
					<Link href="/admin">
						<Button size="lg" variant="outline">
							Go to Admin
						</Button>
					</Link>
				</div>
			</section>

			{/* Features */}
			<section className="container mx-auto px-4 py-20">
				<h2 className="text-3xl font-bold text-center mb-12">
					Everything You Need for Affiliate Success
				</h2>
				<div className="grid md:grid-cols-3 gap-8">
					<Card>
						<CardHeader>
							<Package className="h-10 w-10 text-primary mb-2" />
							<CardTitle>Price Comparison</CardTitle>
							<CardDescription>
								Automatically fetch and compare prices from Lazada and Shopee.
								Show your audience the best deals.
							</CardDescription>
						</CardHeader>
					</Card>
					<Card>
						<CardHeader>
							<Megaphone className="h-10 w-10 text-primary mb-2" />
							<CardTitle>Campaign Management</CardTitle>
							<CardDescription>
								Create targeted campaigns with UTM tracking. Organize products
								and track performance by campaign.
							</CardDescription>
						</CardHeader>
					</Card>
					<Card>
						<CardHeader>
							<TrendingUp className="h-10 w-10 text-primary mb-2" />
							<CardTitle>Analytics Dashboard</CardTitle>
							<CardDescription>
								Track clicks, conversions, and top-performing products. Make
								data-driven decisions.
							</CardDescription>
						</CardHeader>
					</Card>
				</div>
			</section>

			{/* Marketplace Logos */}
			<section className="container mx-auto px-4 py-16 text-center">
				<p className="text-muted-foreground mb-8">Supported Marketplaces</p>
				<div className="flex justify-center gap-12 items-center">
					<div className="flex items-center gap-2">
						<div className="w-12 h-12 bg-lazada rounded-lg flex items-center justify-center">
							<span className="text-white font-bold text-xl">L</span>
						</div>
						<span className="text-2xl font-bold text-lazada">Lazada</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-12 h-12 bg-shopee rounded-lg flex items-center justify-center">
							<span className="text-white font-bold text-xl">S</span>
						</div>
						<span className="text-2xl font-bold text-shopee">Shopee</span>
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="bg-primary text-primary-foreground py-20">
				<div className="container mx-auto px-4 text-center">
					<h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
					<p className="text-lg opacity-90 mb-8">
						Start comparing prices and generating affiliate links today.
					</p>
					<Link href="/admin">
						<Button size="lg" variant="secondary">
							Open Admin Dashboard
						</Button>
					</Link>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t py-8">
				<div className="container mx-auto px-4 text-center text-muted-foreground">
					<p>Affiliate Platform Demo - Built for Jenosize Assignment</p>
					<p className="mt-2">
						<Link href="/api/docs" className="underline">
							API Documentation
						</Link>
					</p>
				</div>
			</footer>
		</div>
	);
}
