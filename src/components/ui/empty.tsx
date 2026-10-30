import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

export type EmptyProps = React.ComponentProps<"div">;

function Empty({ className, ...props }: EmptyProps) {
	return (
		<div
			data-slot="empty"
			className={cn(
				"flex w-full min-w-0 flex-1 flex-col items-center justify-center gap-4 rounded-xl p-6 text-center text-balance",
				className,
			)}
			{...props}
		/>
	);
}

export type EmptyHeaderProps = React.ComponentProps<"div">;

function EmptyHeader({ className, ...props }: EmptyHeaderProps) {
	return (
		<div
			data-slot="empty-header"
			className={cn("flex max-w-sm flex-col items-center gap-1", className)}
			{...props}
		/>
	);
}

const emptyMediaVariants = cva(
	"mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default: "bg-transparent",
				icon: "flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-foreground [&_svg:not([class*='size-'])]:size-4",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export type EmptyMediaProps = React.ComponentProps<"div"> &
	VariantProps<typeof emptyMediaVariants>;

function EmptyMedia({
	className,
	variant = "default",
	...props
}: EmptyMediaProps) {
	return (
		<div
			data-slot="empty-icon"
			data-variant={variant}
			className={cn(emptyMediaVariants({ variant, className }))}
			{...props}
		/>
	);
}

export type EmptyTitleProps = React.ComponentProps<"h3">;

function EmptyTitle({ className, ...props }: EmptyTitleProps) {
	return (
		<h3
			data-slot="empty-title"
			className={cn(
				"font-heading text-sm font-medium tracking-tight",
				className,
			)}
			{...props}
		/>
	);
}

export type EmptyDescriptionProps = React.ComponentProps<"p">;

function EmptyDescription({ className, ...props }: EmptyDescriptionProps) {
	return (
		<p
			data-slot="empty-description"
			className={cn(
				"text-xs/relaxed text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
				className,
			)}
			{...props}
		/>
	);
}

export type EmptyContentProps = React.ComponentProps<"div">;

function EmptyContent({ className, ...props }: EmptyContentProps) {
	return (
		<div
			data-slot="empty-content"
			className={cn(
				"flex w-full max-w-sm min-w-0 flex-col items-center gap-2 text-xs/relaxed text-balance",
				className,
			)}
			{...props}
		/>
	);
}

export {
	Empty,
	EmptyHeader,
	EmptyTitle,
	EmptyDescription,
	EmptyContent,
	EmptyMedia,
};
