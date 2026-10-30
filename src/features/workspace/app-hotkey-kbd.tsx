import { cn } from "cn";
import type * as React from "react";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
	type AppHotkeyId,
	appHotkeys,
	formatKeySymbol,
	isMacPlatform,
} from "@/features/workspace/hotkeys";

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
