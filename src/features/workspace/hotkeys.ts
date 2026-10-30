import { defineAppHotkeys } from "@tanstack/react-hotkeys";

export type AppHotkeyMeta = {
	name: string;
	group: "Workspace" | "Presentation" | "Help";
	description: string;
};

export const appHotkeys = defineAppHotkeys({
	"workspace.toggleLayoutMode": {
		hotkey: "Mod+E",
		meta: {
			name: "Toggle layout mode",
			group: "Workspace",
			description: "Switch between view and edit layout modes",
		},
	},
	"workspace.resetLayout": {
		hotkey: "Mod+Shift+R",
		meta: {
			name: "Reset layout to defaults",
			group: "Workspace",
			description: "Restore workspace panels to equal distribution",
		},
	},
	"presentation.goLive": {
		hotkey: "Mod+Enter",
		meta: {
			name: "Go live",
			group: "Presentation",
			description: "Stage item to live broadcast screen",
		},
	},
	"presentation.toggleBlackout": {
		hotkey: "Mod+B",
		meta: {
			name: "Toggle blackout",
			group: "Presentation",
			description: "Immediately black out projection output",
		},
	},
	"presentation.toggleClear": {
		hotkey: "Mod+Shift+C",
		meta: {
			name: "Clear slide text",
			group: "Presentation",
			description: "Clear active foreground lyrics/slides",
		},
	},
	"help.shortcuts": {
		hotkey: "Mod+/",
		meta: {
			name: "Keyboard shortcuts",
			group: "Help",
			description: "Open keyboard shortcuts reference cheatsheet",
		},
	},
});

declare module "@tanstack/react-hotkeys" {
	interface Register {
		appHotkeys: typeof appHotkeys;
	}
}

export type AppHotkeyId = keyof typeof appHotkeys;

export type HotkeySearchResult = {
	id: AppHotkeyId;
	group: string;
	name: string;
	description: string;
	formattedChord: string;
};

export function isMacPlatform(): boolean {
	if (typeof navigator === "undefined") {
		return false;
	}
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

export function formatKeySymbol(key: string, isMac = isMacPlatform()): string {
	const normalized = key.trim();
	const lower = normalized.toLowerCase();
	const symbolMap = isMac ? MAC_KEY_SYMBOLS : STANDARD_KEY_SYMBOLS;

	return symbolMap[lower] ?? normalized;
}

export function formatHotkeyChord(
	chord: string | readonly string[] | null | undefined,
	isMac = isMacPlatform(),
): string {
	if (!chord) {
		return "";
	}

	if (Array.isArray(chord)) {
		return chord.map((c) => formatHotkeyChord(c, isMac)).join(" ");
	}

	if (typeof chord === "string") {
		const separator = isMac ? " " : " + ";
		return chord
			.split("+")
			.map((k) => formatKeySymbol(k, isMac))
			.filter(Boolean)
			.join(separator);
	}

	return "";
}

function normalizeSearchTerm(term: string): string {
	return term
		.toLowerCase()
		.replace(/\b(cmd|command)\b/g, "mod")
		.replace(/\b(ctrl|control)\b/g, "mod");
}

function getHotkeySearchString(
	hotkey: (typeof appHotkeys)[AppHotkeyId]["hotkey"] | undefined,
): string {
	if (!hotkey) {
		return "";
	}
	if (Array.isArray(hotkey)) {
		return hotkey.join(" ");
	}
	if (typeof hotkey === "string") {
		return hotkey;
	}
	return "";
}

export function searchHotkeys(
	query: string,
	isMac = isMacPlatform(),
): HotkeySearchResult[] {
	const rawQuery = query.trim().toLowerCase();
	const normalizedQuery = normalizeSearchTerm(rawQuery);

	const entries = Object.entries(appHotkeys) as [
		AppHotkeyId,
		(typeof appHotkeys)[AppHotkeyId],
	][];

	const matchingItems: HotkeySearchResult[] = [];

	for (const [id, item] of entries) {
		const name = item.meta?.name ?? "";
		const description = item.meta?.description ?? "";
		const group = item.meta?.group ?? "General";
		const chord = item.hotkey;
		const formattedChord = formatHotkeyChord(chord, isMac);

		if (rawQuery) {
			const nameLower = name.toLowerCase();
			const descLower = description.toLowerCase();
			const groupLower = group.toLowerCase();
			const hotkeyStr = getHotkeySearchString(chord).toLowerCase();
			const normalizedHotkeyStr = normalizeSearchTerm(hotkeyStr);
			const formattedChordLower = formattedChord.toLowerCase();

			const matches =
				nameLower.includes(rawQuery) ||
				descLower.includes(rawQuery) ||
				groupLower.includes(rawQuery) ||
				hotkeyStr.includes(rawQuery) ||
				normalizedHotkeyStr.includes(normalizedQuery) ||
				formattedChordLower.includes(rawQuery);

			if (!matches) {
				continue;
			}
		}

		matchingItems.push({
			id,
			group,
			name,
			description,
			formattedChord,
		});
	}

	return matchingItems;
}
