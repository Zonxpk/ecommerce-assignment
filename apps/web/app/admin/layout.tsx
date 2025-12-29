"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
	LayoutDashboard,
	Package,
	Megaphone,
	Link as LinkIcon,
	BarChart3,
	Home,
} from "lucide-react";

const navigation = [
	{ name: "Dashboard", href: "/admin", icon: LayoutDashboard },
	{ name: "Products", href: "/admin/products", icon: Package },
	{ name: "Campaigns", href: "/admin/campaigns", icon: Megaphone },
	{ name: "Links", href: "/admin/links", icon: LinkIcon },
];

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Sidebar */}
			<div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r">
				<div className="flex flex-col h-full">
					{/* Logo */}
					<div className="flex items-center gap-2 px-6 py-4 border-b">
						<BarChart3 className="h-8 w-8 text-primary" />
						<span className="font-bold text-xl">Affiliate</span>
					</div>

					{/* Navigation */}
					<nav className="flex-1 px-4 py-4 space-y-1">
						{navigation.map((item) => {
							const isActive = pathname === item.href;
							return (
								<Link
									key={item.name}
									href={item.href}
									className={cn(
										"flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
										isActive
											? "bg-primary text-primary-foreground"
											: "text-gray-700 hover:bg-gray-100",
									)}
								>
									<item.icon className="h-5 w-5" />
									{item.name}
								</Link>
							);
						})}
					</nav>

					{/* Footer */}
					<div className="px-4 py-4 border-t">
						<Link
							href="/"
							className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
						>
							<Home className="h-5 w-5" />
							View Public Site
						</Link>
					</div>
				</div>
			</div>

			{/* Main content */}
			<div className="pl-64">
				<main className="p-8">{children}</main>
			</div>
		</div>
	);
}
