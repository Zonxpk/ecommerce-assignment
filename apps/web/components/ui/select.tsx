"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectContextType {
	value: string;
	onValueChange: (value: string) => void;
	open: boolean;
	setOpen: (open: boolean) => void;
}

const SelectContext = React.createContext<SelectContextType | undefined>(
	undefined,
);

function useSelect() {
	const context = React.useContext(SelectContext);
	if (!context) {
		throw new Error("Select components must be used within a Select");
	}
	return context;
}

interface SelectProps {
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	disabled?: boolean;
	children: React.ReactNode;
}

function Select({
	value: controlledValue,
	defaultValue = "",
	onValueChange,
	disabled,
	children,
}: SelectProps) {
	const [uncontrolledValue, setUncontrolledValue] =
		React.useState(defaultValue);
	const [open, setOpen] = React.useState(false);

	const isControlled = controlledValue !== undefined;
	const value = isControlled ? controlledValue : uncontrolledValue;

	const handleValueChange = React.useCallback(
		(newValue: string) => {
			if (disabled) return;
			if (!isControlled) {
				setUncontrolledValue(newValue);
			}
			onValueChange?.(newValue);
			setOpen(false);
		},
		[isControlled, onValueChange, disabled],
	);

	const handleSetOpen = React.useCallback(
		(newOpen: boolean) => {
			if (disabled) return;
			setOpen(newOpen);
		},
		[disabled],
	);

	return (
		<SelectContext.Provider
			value={{
				value,
				onValueChange: handleValueChange,
				open,
				setOpen: handleSetOpen,
			}}
		>
			<div
				className={cn("relative", disabled && "opacity-50 cursor-not-allowed")}
			>
				{children}
			</div>
		</SelectContext.Provider>
	);
}

interface SelectTriggerProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	children?: React.ReactNode;
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
	({ className, children, ...props }, ref) => {
		const { open, setOpen } = useSelect();

		return (
			<button
				ref={ref}
				type="button"
				className={cn(
					"flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
					className,
				)}
				onClick={() => setOpen(!open)}
				{...props}
			>
				{children}
				<ChevronDown
					className={cn(
						"h-4 w-4 opacity-50 transition-transform",
						open && "rotate-180",
					)}
				/>
			</button>
		);
	},
);
SelectTrigger.displayName = "SelectTrigger";

function SelectValue({ placeholder }: { placeholder?: string }) {
	const { value } = useSelect();
	return (
		<span className={cn(!value && "text-muted-foreground")}>
			{value || placeholder}
		</span>
	);
}

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
	({ className, children, ...props }, ref) => {
		const { open, setOpen } = useSelect();
		const contentRef = React.useRef<HTMLDivElement>(null);

		React.useEffect(() => {
			const handleClickOutside = (e: MouseEvent) => {
				if (
					contentRef.current &&
					!contentRef.current.contains(e.target as Node)
				) {
					setOpen(false);
				}
			};

			if (open) {
				document.addEventListener("mousedown", handleClickOutside);
			}

			return () => {
				document.removeEventListener("mousedown", handleClickOutside);
			};
		}, [open, setOpen]);

		if (!open) return null;

		return (
			<div
				ref={contentRef}
				className={cn(
					"absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
					className,
				)}
				{...props}
			>
				{children}
			</div>
		);
	},
);
SelectContent.displayName = "SelectContent";

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
	value: string;
	children: React.ReactNode;
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
	({ className, value, children, ...props }, ref) => {
		const { value: selectedValue, onValueChange } = useSelect();
		const isSelected = selectedValue === value;

		return (
			<div
				ref={ref}
				className={cn(
					"relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
					isSelected && "bg-accent text-accent-foreground",
					className,
				)}
				onClick={() => onValueChange(value)}
				{...props}
			>
				{isSelected && (
					<span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
						<svg
							className="h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M5 13l4 4L19 7"
							/>
						</svg>
					</span>
				)}
				{children}
			</div>
		);
	},
);
SelectItem.displayName = "SelectItem";

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
