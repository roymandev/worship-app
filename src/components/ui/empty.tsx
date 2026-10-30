import { cn } from "cn";

export type EmptyStateProps = {
	title: React.ReactNode;
	description?: React.ReactNode;
	icon?: React.ReactNode;
	startSlot?: React.ReactNode;
	action?: React.ReactNode;
	className?: string;
};

export function EmptyState({
	icon,
	startSlot,
	title,
	description,
	action,
	className,
}: EmptyStateProps) {
	const leadingSlot = startSlot ?? icon;

	return (
		<div
			data-slot="empty"
			className={cn(
				"flex w-full min-w-0 flex-1 flex-col items-center justify-center gap-4 rounded-xl p-6 text-center text-balance",
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
