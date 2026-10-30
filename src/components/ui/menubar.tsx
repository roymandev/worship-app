"use client";

import { Menubar as MenubarPrimitive } from "@base-ui/react/menubar";
import { cn } from "cn";
import type * as React from "react";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type MenubarProps = MenubarPrimitive.Props;

function Menubar({ className, ...props }: MenubarProps) {
	return (
		<MenubarPrimitive
			data-slot="menubar"
			className={cn("flex h-9 items-center rounded-lg p-1", className)}
			{...props}
		/>
	);
}

export type MenubarMenuProps = React.ComponentProps<typeof DropdownMenu>;

function MenubarMenu({ ...props }: MenubarMenuProps) {
	return <DropdownMenu data-slot="menubar-menu" {...props} />;
}

export type MenubarGroupProps = React.ComponentProps<typeof DropdownMenuGroup>;

function MenubarGroup({ ...props }: MenubarGroupProps) {
	return <DropdownMenuGroup data-slot="menubar-group" {...props} />;
}

export type MenubarPortalProps = React.ComponentProps<
	typeof DropdownMenuPortal
>;

function MenubarPortal({ ...props }: MenubarPortalProps) {
	return <DropdownMenuPortal data-slot="menubar-portal" {...props} />;
}

export type MenubarTriggerProps = React.ComponentProps<
	typeof DropdownMenuTrigger
>;

function MenubarTrigger({ className, ...props }: MenubarTriggerProps) {
	return (
		<DropdownMenuTrigger
			data-slot="menubar-trigger"
			className={cn(
				"focus-ring flex items-center rounded-[calc(var(--radius-md)-2px)] px-2 py-[calc(--spacing(0.85))] text-xs/relaxed font-medium select-none hover:bg-muted aria-expanded:bg-muted",
				className,
			)}
			{...props}
		/>
	);
}

export type MenubarContentProps = React.ComponentProps<
	typeof DropdownMenuContent
>;

function MenubarContent({
	className,
	align = "start",
	alignOffset = -4,
	sideOffset = 8,
	...props
}: MenubarContentProps) {
	return (
		<DropdownMenuContent
			data-slot="menubar-content"
			align={align}
			alignOffset={alignOffset}
			sideOffset={sideOffset}
			className={cn(
				"w-auto min-w-56 rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
				className,
			)}
			{...props}
		/>
	);
}

export type MenubarItemProps = React.ComponentProps<typeof DropdownMenuItem>;

function MenubarItem({
	className,
	inset,
	variant = "default",
	...props
}: MenubarItemProps) {
	return (
		<DropdownMenuItem
			data-slot="menubar-item"
			data-inset={inset}
			data-variant={variant}
			variant={variant}
			className={cn(
				"group/menubar-item min-h-7 gap-2 rounded-md px-2 py-1 text-xs/relaxed focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7.5 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:opacity-50 [&_svg:not([class*='size-'])]:size-3.5 data-[variant=destructive]:*:[svg]:text-destructive!",
				className,
			)}
			{...props}
		/>
	);
}

export type MenubarCheckboxItemProps = React.ComponentProps<
	typeof DropdownMenuCheckboxItem
>;

function MenubarCheckboxItem({
	className,
	...props
}: MenubarCheckboxItemProps) {
	return (
		<DropdownMenuCheckboxItem
			data-slot="menubar-checkbox-item"
			className={cn(className)}
			{...props}
		/>
	);
}

export type MenubarRadioGroupProps = React.ComponentProps<
	typeof DropdownMenuRadioGroup
>;

function MenubarRadioGroup({ ...props }: MenubarRadioGroupProps) {
	return <DropdownMenuRadioGroup data-slot="menubar-radio-group" {...props} />;
}

export type MenubarRadioItemProps = React.ComponentProps<
	typeof DropdownMenuRadioItem
>;

function MenubarRadioItem({ className, ...props }: MenubarRadioItemProps) {
	return (
		<DropdownMenuRadioItem
			data-slot="menubar-radio-item"
			className={cn(className)}
			{...props}
		/>
	);
}

export type MenubarLabelProps = React.ComponentProps<
	typeof DropdownMenuLabel
> & {
	inset?: boolean;
};

function MenubarLabel({ className, inset, ...props }: MenubarLabelProps) {
	return (
		<DropdownMenuLabel
			data-slot="menubar-label"
			data-inset={inset}
			className={cn(
				"px-2 py-1.5 text-xs text-muted-foreground data-inset:pl-7.5",
				className,
			)}
			{...props}
		/>
	);
}

export type MenubarSeparatorProps = React.ComponentProps<
	typeof DropdownMenuSeparator
>;

function MenubarSeparator({ className, ...props }: MenubarSeparatorProps) {
	return (
		<DropdownMenuSeparator
			data-slot="menubar-separator"
			className={cn("-mx-1 my-1 h-px bg-border/50", className)}
			{...props}
		/>
	);
}

export type MenubarShortcutProps = React.ComponentProps<
	typeof DropdownMenuShortcut
>;

function MenubarShortcut({ className, ...props }: MenubarShortcutProps) {
	return (
		<DropdownMenuShortcut
			data-slot="menubar-shortcut"
			className={cn(
				"ml-auto text-[0.625rem] tracking-widest text-muted-foreground group-focus/menubar-item:text-accent-foreground",
				className,
			)}
			{...props}
		/>
	);
}

export type MenubarSubProps = React.ComponentProps<typeof DropdownMenuSub>;

function MenubarSub({ ...props }: MenubarSubProps) {
	return <DropdownMenuSub data-slot="menubar-sub" {...props} />;
}

export type MenubarSubTriggerProps = React.ComponentProps<
	typeof DropdownMenuSubTrigger
> & {
	inset?: boolean;
};

function MenubarSubTrigger({
	className,
	inset,
	...props
}: MenubarSubTriggerProps) {
	return (
		<DropdownMenuSubTrigger
			data-slot="menubar-sub-trigger"
			data-inset={inset}
			className={cn(
				"min-h-7 gap-2 rounded-md px-2 py-1 text-xs focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7.5 data-open:bg-accent data-open:text-accent-foreground [&_svg:not([class*='size-'])]:size-3.5",
				className,
			)}
			{...props}
		/>
	);
}

export type MenubarSubContentProps = React.ComponentProps<
	typeof DropdownMenuSubContent
>;

function MenubarSubContent({ className, ...props }: MenubarSubContentProps) {
	return (
		<DropdownMenuSubContent
			data-slot="menubar-sub-content"
			className={cn(
				"min-w-32 rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
				className,
			)}
			{...props}
		/>
	);
}

export {
	Menubar,
	MenubarPortal,
	MenubarMenu,
	MenubarTrigger,
	MenubarContent,
	MenubarGroup,
	MenubarSeparator,
	MenubarLabel,
	MenubarItem,
	MenubarShortcut,
	MenubarCheckboxItem,
	MenubarRadioGroup,
	MenubarRadioItem,
	MenubarSub,
	MenubarSubTrigger,
	MenubarSubContent,
};
