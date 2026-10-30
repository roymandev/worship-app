import { cn } from "cn";
import type * as React from "react";

export type KbdProps = React.ComponentProps<"kbd">;

function Kbd({ className, ...props }: KbdProps) {
	return (
		<kbd
			data-slot="kbd"
			className={cn(
				"pointer-events-none inline-flex h-5 w-fit min-w-0 items-center justify-center gap-1 rounded-xs px-0.5 font-sans text-[0.625rem] font-medium text-muted-foreground select-none [&_svg:not([class*='size-'])]:size-3",
				className,
			)}
			{...props}
		/>
	);
}

export type KbdGroupProps = React.ComponentProps<"kbd">;

function KbdGroup({ className, ...props }: KbdGroupProps) {
	return (
		<kbd
			data-slot="kbd-group"
			className={cn("inline-flex items-center gap-0.5", className)}
			{...props}
		/>
	);
}

export { Kbd, KbdGroup };
