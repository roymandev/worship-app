import { cn } from "cn";
import type * as React from "react";

export type InputProps = React.ComponentProps<"input">;

function Input({ className, type = "text", ...props }: InputProps) {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(
				"focus-ring flex h-8 w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-1 text-xs text-foreground shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-xs file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
				className,
			)}
			{...props}
		/>
	);
}

export { Input };
