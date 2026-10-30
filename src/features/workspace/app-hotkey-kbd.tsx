import { cn } from "cn";
import type * as React from "react";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { type AppHotkeyId, appHotkeys } from "@/features/workspace/hotkeys";

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

export type HotkeyChordKbdProps = React.ComponentProps<"kbd"> & {
	chord: string;
	kbdClassName?: string;
};

export function HotkeyChordKbd({
	chord,
	className,
	kbdClassName,
	...props
}: HotkeyChordKbdProps) {
	const isMac = isMacPlatform();
	const keys = chord
		.split("+")
		.map((k) => k.trim())
		.filter(Boolean);

	return (
		<KbdGroup className={className} {...props}>
			{keys.map((key) => {
				const itemKey = `${chord}-${key}`;
				return (
					<Kbd key={itemKey} className={kbdClassName}>
						{formatKeySymbol(key, isMac)}
					</Kbd>
				);
			})}
		</KbdGroup>
	);
}

export type AppHotkeyKbdProps = {
	id: AppHotkeyId;
	className?: string;
	kbdClassName?: string;
};

export function AppHotkeyKbd({
	id,
	className,
	kbdClassName,
}: AppHotkeyKbdProps) {
	const definition = appHotkeys[id];
	if (!definition || !definition.hotkey) {
		return null;
	}

	const rawHotkey = definition.hotkey;

	if (Array.isArray(rawHotkey)) {
		return (
			<div className={cn("inline-flex items-center gap-1", className)}>
				{rawHotkey.map((step) => (
					<HotkeyChordKbd
						key={`${id}-${step}`}
						chord={step}
						kbdClassName={kbdClassName}
					/>
				))}
			</div>
		);
	}

	if (typeof rawHotkey === "string") {
		return (
			<HotkeyChordKbd
				chord={rawHotkey}
				className={className}
				kbdClassName={kbdClassName}
			/>
		);
	}

	return null;
}
