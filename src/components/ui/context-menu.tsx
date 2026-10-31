import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu";
import { IconCheck, IconChevronRight } from "@tabler/icons-react";
import { cn } from "cn";
import type * as React from "react";

export type ContextMenuProps = ContextMenuPrimitive.Root.Props;

function ContextMenu({ ...props }: ContextMenuProps) {
	return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />;
}

export type ContextMenuPortalProps = ContextMenuPrimitive.Portal.Props;

function ContextMenuPortal({ ...props }: ContextMenuPortalProps) {
	return (
		<ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />
	);
}

export type ContextMenuTriggerProps = ContextMenuPrimitive.Trigger.Props;

function ContextMenuTrigger({ className, ...props }: ContextMenuTriggerProps) {
	return (
		<ContextMenuPrimitive.Trigger
			data-slot="context-menu-trigger"
			className={cn("select-none", className)}
			{...props}
		/>
	);
}

export type ContextMenuContentProps = ContextMenuPrimitive.Popup.Props &
	Pick<
		ContextMenuPrimitive.Positioner.Props,
		"align" | "alignOffset" | "side" | "sideOffset"
	>;

function ContextMenuContent({
	className,
	align = "start",
	alignOffset = 4,
	side = "right",
	sideOffset = 0,
	...props
}: ContextMenuContentProps) {
	return (
		<ContextMenuPrimitive.Portal>
			<ContextMenuPrimitive.Positioner
				className="isolate z-50 outline-none"
				align={align}
				alignOffset={alignOffset}
				side={side}
				sideOffset={sideOffset}
			>
				<ContextMenuPrimitive.Popup
					data-slot="context-menu-content"
					className={cn(
						"z-50 max-h-(--available-height) min-w-48 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
						className,
					)}
					{...props}
				/>
			</ContextMenuPrimitive.Positioner>
		</ContextMenuPrimitive.Portal>
	);
}

export type ContextMenuGroupProps = ContextMenuPrimitive.Group.Props;

function ContextMenuGroup({ ...props }: ContextMenuGroupProps) {
	return (
		<ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />
	);
}

export type ContextMenuLabelProps = ContextMenuPrimitive.GroupLabel.Props & {
	inset?: boolean;
};

function ContextMenuLabel({
	className,
	inset,
	...props
}: ContextMenuLabelProps) {
	return (
		<ContextMenuPrimitive.GroupLabel
			data-slot="context-menu-label"
			data-inset={inset}
			className={cn(
				"px-2 py-1.5 text-xs text-muted-foreground data-inset:pl-7.5",
				className,
			)}
			{...props}
		/>
	);
}

export type ContextMenuItemProps = ContextMenuPrimitive.Item.Props & {
	inset?: boolean;
	variant?: "default" | "destructive";
};

function ContextMenuItem({
	className,
	inset,
	variant = "default",
	...props
}: ContextMenuItemProps) {
	return (
		<ContextMenuPrimitive.Item
			data-slot="context-menu-item"
			data-inset={inset}
			data-variant={variant}
			className={cn(
				"group/context-menu-item relative flex min-h-7 cursor-default items-center gap-2 rounded-md px-2 py-1 text-xs/relaxed outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7.5 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5 data-[variant=destructive]:*:[svg]:text-destructive",
				variant === "destructive"
					? "focus-ring-inset-destructive"
					: "focus-ring-inset",
				className,
			)}
			{...props}
		/>
	);
}

export type ContextMenuSubProps = ContextMenuPrimitive.SubmenuRoot.Props;

function ContextMenuSub({ ...props }: ContextMenuSubProps) {
	return (
		<ContextMenuPrimitive.SubmenuRoot data-slot="context-menu-sub" {...props} />
	);
}

export type ContextMenuSubTriggerProps =
	ContextMenuPrimitive.SubmenuTrigger.Props & {
		inset?: boolean;
	};

function ContextMenuSubTrigger({
	className,
	inset,
	children,
	...props
}: ContextMenuSubTriggerProps) {
	return (
		<ContextMenuPrimitive.SubmenuTrigger
			data-slot="context-menu-sub-trigger"
			data-inset={inset}
			className={cn(
				"focus-ring-inset flex min-h-7 cursor-default items-center gap-2 rounded-md px-2 py-1 text-xs outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7.5 data-open:bg-accent data-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
				className,
			)}
			{...props}
		>
			{children}
			<IconChevronRight className="ml-auto" />
		</ContextMenuPrimitive.SubmenuTrigger>
	);
}

export type ContextMenuSubContentProps = React.ComponentProps<
	typeof ContextMenuContent
>;

function ContextMenuSubContent({ ...props }: ContextMenuSubContentProps) {
	return (
		<ContextMenuContent
			data-slot="context-menu-sub-content"
			className="shadow-lg"
			side="right"
			{...props}
		/>
	);
}

export type ContextMenuCheckboxItemProps =
	ContextMenuPrimitive.CheckboxItem.Props & {
		inset?: boolean;
	};

function ContextMenuCheckboxItem({
	className,
	children,
	checked,
	inset,
	...props
}: ContextMenuCheckboxItemProps) {
	return (
		<ContextMenuPrimitive.CheckboxItem
			data-slot="context-menu-checkbox-item"
			data-inset={inset}
			className={cn(
				"focus-ring-inset relative flex min-h-7 cursor-default items-center gap-2 rounded-md py-1.5 pr-8 pl-2 text-xs outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-7.5 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
				className,
			)}
			checked={checked}
			{...props}
		>
			<span className="pointer-events-none absolute right-2 flex items-center justify-center">
				<ContextMenuPrimitive.CheckboxItemIndicator>
					<IconCheck />
				</ContextMenuPrimitive.CheckboxItemIndicator>
			</span>
			{children}
		</ContextMenuPrimitive.CheckboxItem>
	);
}

export type ContextMenuRadioGroupProps = ContextMenuPrimitive.RadioGroup.Props;

function ContextMenuRadioGroup({ ...props }: ContextMenuRadioGroupProps) {
	return (
		<ContextMenuPrimitive.RadioGroup
			data-slot="context-menu-radio-group"
			{...props}
		/>
	);
}

export type ContextMenuRadioItemProps = ContextMenuPrimitive.RadioItem.Props & {
	inset?: boolean;
};

function ContextMenuRadioItem({
	className,
	children,
	inset,
	...props
}: ContextMenuRadioItemProps) {
	return (
		<ContextMenuPrimitive.RadioItem
			data-slot="context-menu-radio-item"
			data-inset={inset}
			className={cn(
				"focus-ring-inset relative flex min-h-7 cursor-default items-center gap-2 rounded-md py-1.5 pr-8 pl-2 text-xs outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-7.5 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
				className,
			)}
			{...props}
		>
			<span className="pointer-events-none absolute right-2 flex items-center justify-center">
				<ContextMenuPrimitive.RadioItemIndicator>
					<IconCheck />
				</ContextMenuPrimitive.RadioItemIndicator>
			</span>
			{children}
		</ContextMenuPrimitive.RadioItem>
	);
}

export type ContextMenuSeparatorProps = ContextMenuPrimitive.Separator.Props;

function ContextMenuSeparator({
	className,
	...props
}: ContextMenuSeparatorProps) {
	return (
		<ContextMenuPrimitive.Separator
			data-slot="context-menu-separator"
			className={cn("-mx-1 my-1 h-px bg-border/50", className)}
			{...props}
		/>
	);
}

export type ContextMenuShortcutProps = React.ComponentProps<"span">;

function ContextMenuShortcut({
	className,
	...props
}: ContextMenuShortcutProps) {
	return (
		<span
			data-slot="context-menu-shortcut"
			className={cn(
				"ml-auto text-[0.625rem] tracking-widest text-muted-foreground group-focus/context-menu-item:text-accent-foreground",
				className,
			)}
			{...props}
		/>
	);
}

export {
	ContextMenu,
	ContextMenuTrigger,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuCheckboxItem,
	ContextMenuRadioItem,
	ContextMenuLabel,
	ContextMenuSeparator,
	ContextMenuShortcut,
	ContextMenuGroup,
	ContextMenuPortal,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuRadioGroup,
};
