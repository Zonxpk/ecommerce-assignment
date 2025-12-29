import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
	variant?:
		| "default"
		| "secondary"
		| "outline"
		| "success"
		| "lazada"
		| "shopee";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
	const variants = {
		default: "bg-primary text-primary-foreground",
		secondary: "bg-secondary text-secondary-foreground",
		outline: "border border-input bg-background",
		success: "bg-green-500 text-white",
		lazada: "bg-lazada text-white",
		shopee: "bg-shopee text-white",
	};

	return (
		<span
			className={cn(
				"inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
				variants[variant],
				className,
			)}
			{...props}
		/>
	);
}

export { Badge };
