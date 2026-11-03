import { cn } from "cn";

export type EmptyStateProps = {
	variant?: "default" | "inline";
	title: React.ReactNode;
	description?: React.ReactNode;
	icon?: React.ReactNode;
	startSlot?: React.ReactNode;
	action?: React.ReactNode;
	className?: string;
};

export function EmptyState({
	variant = "default",
	icon,
	startSlot,
	title,
	description,
	action,
	className,
}: EmptyStateProps) {
	const leadingSlot = startSlot ?? icon;

	if (variant === "inline") {
		return (
			<div
				data-slot="empty"
				data-variant="inline"
				className={cn(
					"flex w-full min-w-0 items-center gap-3 rounded-md border border-dashed border-border/60 p-3 text-left",
					className,
				)}
			>
				{leadingSlot ? (
					<div
						data-slot="empty-icon"
						data-variant="icon"
						className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-foreground [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0"
					>
						{leadingSlot}
					</div>
				) : null}
				<div
					data-slot="empty-header"
					className="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-left"
				>
					<h3
						data-slot="empty-title"
						className="w-full truncate font-heading text-xs font-medium tracking-tight text-foreground"
					>
						{title}
					</h3>
					{description ? (
						<p
							data-slot="empty-description"
							className="w-full truncate text-[0.6875rem] text-muted-foreground"
						>
							{description}
						</p>
					) : null}
				</div>
				{action ? (
					<div
						data-slot="empty-content"
						className="flex shrink-0 items-center gap-2"
					>
						{action}
					</div>
				) : null}
			</div>
		);
	}

	return (
		<div
			data-slot="empty"
			className={cn(
				"flex h-full min-h-full w-full min-w-0 flex-1 flex-col items-center justify-center gap-4 rounded-xl p-6 text-center text-balance",
				className,
			)}
		>
			<div
				data-slot="empty-header"
				className="flex max-w-sm flex-col items-center gap-1"
			>
				{leadingSlot ? (
					<div
						data-slot="empty-icon"
						data-variant="icon"
						className="mb-2 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-foreground [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0"
					>
						{leadingSlot}
					</div>
				) : null}
				<h3
					data-slot="empty-title"
					className="font-heading text-sm font-medium tracking-tight"
				>
					{title}
				</h3>
				{description ? (
					<p
						data-slot="empty-description"
						className="text-xs/relaxed text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary"
					>
						{description}
					</p>
				) : null}
			</div>
			{action ? (
				<div
					data-slot="empty-content"
					className="flex w-full max-w-sm min-w-0 flex-col items-center gap-2 text-xs/relaxed text-balance"
				>
					{action}
				</div>
			) : null}
		</div>
	);
}
