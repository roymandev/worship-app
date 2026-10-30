import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { cn } from "cn";

export type PopoverProps = PopoverPrimitive.Root.Props;

function Popover({ ...props }: PopoverProps) {
	return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

export type PopoverTriggerProps = PopoverPrimitive.Trigger.Props;

function PopoverTrigger({ ...props }: PopoverTriggerProps) {
	return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

export type PopoverPortalProps = PopoverPrimitive.Portal.Props;

function PopoverPortal({ ...props }: PopoverPortalProps) {
	return <PopoverPrimitive.Portal data-slot="popover-portal" {...props} />;
}

export type PopoverPositionerProps = PopoverPrimitive.Positioner.Props;

function PopoverPositioner({ className, ...props }: PopoverPositionerProps) {
	return (
		<PopoverPrimitive.Positioner
			data-slot="popover-positioner"
			className={cn("isolate z-50", className)}
			{...props}
		/>
	);
}

export type PopoverCloseProps = PopoverPrimitive.Close.Props;

function PopoverClose({ ...props }: PopoverCloseProps) {
	return <PopoverPrimitive.Close data-slot="popover-close" {...props} />;
}

export type PopoverArrowProps = PopoverPrimitive.Arrow.Props;

function PopoverArrow({ className, ...props }: PopoverArrowProps) {
	return (
		<PopoverPrimitive.Arrow
			data-slot="popover-arrow"
			className={cn("fill-popover stroke-border", className)}
			{...props}
		/>
	);
}

export type PopoverContentProps = PopoverPrimitive.Popup.Props &
	Pick<
		PopoverPrimitive.Positioner.Props,
		"align" | "alignOffset" | "side" | "sideOffset" | "anchor"
	>;

function PopoverContent({
	className,
	align = "center",
	alignOffset = 0,
	side = "bottom",
	sideOffset = 4,
	anchor,
	children,
	...props
}: PopoverContentProps) {
	return (
		<PopoverPortal>
			<PopoverPositioner
				align={align}
				alignOffset={alignOffset}
				side={side}
				sideOffset={sideOffset}
				anchor={anchor}
			>
				<PopoverPrimitive.Popup
					data-slot="popover-content"
					className={cn(
						"focus-ring z-50 w-72 rounded-xl bg-popover p-4 text-xs/relaxed text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
						className,
					)}
					{...props}
				>
					{children}
				</PopoverPrimitive.Popup>
			</PopoverPositioner>
		</PopoverPortal>
	);
}

export type PopoverTitleProps = PopoverPrimitive.Title.Props;

function PopoverTitle({ className, ...props }: PopoverTitleProps) {
	return (
		<PopoverPrimitive.Title
			data-slot="popover-title"
			className={cn("font-medium text-xs text-foreground", className)}
			{...props}
		/>
	);
}

export type PopoverDescriptionProps = PopoverPrimitive.Description.Props;

function PopoverDescription({ className, ...props }: PopoverDescriptionProps) {
	return (
		<PopoverPrimitive.Description
			data-slot="popover-description"
			className={cn("text-muted-foreground text-xs/relaxed", className)}
			{...props}
		/>
	);
}

export {
	Popover,
	PopoverTrigger,
	PopoverPortal,
	PopoverPositioner,
	PopoverContent,
	PopoverClose,
	PopoverArrow,
	PopoverTitle,
	PopoverDescription,
};
