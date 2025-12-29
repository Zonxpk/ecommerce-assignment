import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="text-center">
				<h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
				<h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
				<p className="text-muted-foreground mb-6">
					The page you're looking for doesn't exist or has been moved.
				</p>
				<Link href="/">
					<Button>Go Home</Button>
				</Link>
			</div>
		</div>
	);
}
