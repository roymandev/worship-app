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

function isMacPlatform(): boolean {
	if (typeof navigator === "undefined") {
		return false;
	}
	// Support newer User-Agent Client Hints if available, fallback to navigator.platform/userAgent
	const nav = navigator as unknown as {
		userAgentData?: { platform?: string };
		platform?: string;
	};
	const platformString =
		nav.userAgentData?.platform || nav.platform || navigator.userAgent;
	return /(Mac|iPhone|iPod|iPad)/i.test(platformString);
}

const MAC_KEY_SYMBOLS: Record<string, string> = {
	mod: "⌘",
	meta: "⌘",
	cmd: "⌘",
	command: "⌘",
	alt: "⌥",
	opt: "⌥",
	option: "⌥",
	shift: "⇧",
	ctrl: "⌃",
	control: "⌃",
	enter: "↵",
	return: "↵",
	backspace: "⌫",
	escape: "Esc",
	esc: "Esc",
};

const STANDARD_KEY_SYMBOLS: Record<string, string> = {
	mod: "Ctrl",
	ctrl: "Ctrl",
	control: "Ctrl",
	alt: "Alt",
	opt: "Alt",
	option: "Alt",
	shift: "Shift",
	enter: "Enter",
	return: "Enter",
	backspace: "Backspace",
	escape: "Esc",
	esc: "Esc",
};

function formatKeySymbol(key: string, isMac: boolean): string {
	const normalized = key.trim();
	const lower = normalized.toLowerCase();
	const symbolMap = isMac ? MAC_KEY_SYMBOLS : STANDARD_KEY_SYMBOLS;

	return symbolMap[lower] ?? normalized;
}

export type HotkeysKbdProps = React.ComponentProps<"kbd"> & {
	chord?: string | readonly string[];
	kbdClassName?: string;
};

function HotkeysKbd({
	chord,
	className,
	kbdClassName,
	...props
}: HotkeysKbdProps) {
	const effectiveShortcut = Array.isArray(chord)
		? chord.join(" ")
		: typeof chord === "string"
			? chord
			: "";
	const isMac = isMacPlatform();
	const keys = effectiveShortcut
		.split("+")
		.map((k) => k.trim())
		.filter(Boolean);

	return (
		<KbdGroup className={className} {...props}>
			{keys.map((key, index) => {
				const itemKey = `${key}-${effectiveShortcut}-${index}`;
				return (
					<Kbd key={itemKey} className={kbdClassName}>
						{formatKeySymbol(key, isMac)}
					</Kbd>
				);
			})}
		</KbdGroup>
	);
}

export { Kbd, KbdGroup, HotkeysKbd, formatKeySymbol, isMacPlatform };
