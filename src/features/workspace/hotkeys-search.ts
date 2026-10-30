import type { AppHotkeyMeta, AppHotkeys } from "@/features/workspace/hotkeys";

export type HotkeyPlatform = "mac" | "other";

export type HotkeyMatchItem = {
	readonly id: string;
	readonly name: string;
	readonly description: string;
	readonly group: string;
	/**
	 * Pre-formatted chord tokens ready for rendering in <Kbd> elements.
	 * Chords are split into steps (for sequences) and tokens (for chords).
	 * Example for "Mod+Shift+R" on mac: [["⌘", "⇧", "R"]]
	 * Example for "Mod+Shift+R" on other: [["Ctrl", "Shift", "R"]]
	 */
	readonly chordTokens: readonly (readonly string[])[];
	/** Flat list of formatted tokens for simple single-chord display */
	readonly formattedTokens: readonly string[];
	readonly rawHotkey: string | readonly string[] | null;
	/** Alias for rawHotkey to ensure backwards compatibility with components expecting .hotkey */
	readonly hotkey: string | readonly string[] | null;
};

export type HotkeyMatchGroup = {
	readonly group: string;
	readonly items: readonly HotkeyMatchItem[];
};

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

export function detectPlatform(): HotkeyPlatform {
	if (typeof navigator === "undefined") {
		return "other";
	}
	const nav = navigator as unknown as {
		userAgentData?: { platform?: string };
		platform?: string;
	};
	const platformString =
		nav.userAgentData?.platform || nav.platform || navigator.userAgent;
	return /(Mac|iPhone|iPod|iPad)/i.test(platformString) ? "mac" : "other";
}

function formatKeySymbol(key: string, platform: HotkeyPlatform): string {
	const normalized = key.trim();
	const lower = normalized.toLowerCase();
	const symbolMap = platform === "mac" ? MAC_KEY_SYMBOLS : STANDARD_KEY_SYMBOLS;

	return symbolMap[lower] ?? normalized;
}

export function formatChordTokens(
	hotkey: string | readonly string[] | null | undefined,
	platform: HotkeyPlatform,
): readonly (readonly string[])[] {
	if (!hotkey) {
		return [];
	}

	const chords: readonly string[] = Array.isArray(hotkey) ? hotkey : [hotkey];

	return chords.map((chord: string) => {
		return chord
			.split("+")
			.map((k: string) => k.trim())
			.filter(Boolean)
			.map((key: string) => formatKeySymbol(key, platform));
	});
}

function normalizeSearchTerm(term: string): string {
	return term
		.toLowerCase()
		.replace(/\b(cmd|command)\b/g, "mod")
		.replace(/\b(ctrl|control)\b/g, "mod");
}

function getHotkeySearchString(
	hotkey: string | readonly string[] | null | undefined,
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

export function queryHotkeyCatalog(
	catalog: AppHotkeys,
	query: string,
	platform: HotkeyPlatform = detectPlatform(),
): readonly HotkeyMatchGroup[] {
	const rawQuery = query.trim().toLowerCase();
	const normalizedQuery = normalizeSearchTerm(rawQuery);

	const groupsMap = new Map<string, HotkeyMatchItem[]>();

	for (const [id, definition] of Object.entries(catalog)) {
		const meta = (definition.meta as AppHotkeyMeta | undefined) ?? {
			name: id,
			description: "",
			group: "General" as const,
		};

		const name = meta.name || id;
		const description = meta.description || "";
		const group = meta.group || "General";
		const rawHotkey = definition.hotkey ?? null;
		const hotkeyStr = getHotkeySearchString(rawHotkey).toLowerCase();
		const normalizedHotkeyStr = normalizeSearchTerm(hotkeyStr);

		const chordTokens = formatChordTokens(rawHotkey, platform);
		const formattedTokens = chordTokens.flat();

		const matches =
			!rawQuery ||
			id.toLowerCase().includes(rawQuery) ||
			name.toLowerCase().includes(rawQuery) ||
			description.toLowerCase().includes(rawQuery) ||
			group.toLowerCase().includes(rawQuery) ||
			hotkeyStr.includes(rawQuery) ||
			normalizedHotkeyStr.includes(normalizedQuery) ||
			formattedTokens.some((token) => token.toLowerCase().includes(rawQuery));

		if (matches) {
			const item: HotkeyMatchItem = {
				id,
				name,
				description,
				group,
				rawHotkey,
				hotkey: rawHotkey,
				chordTokens,
				formattedTokens,
			};

			let groupItems = groupsMap.get(group);
			if (!groupItems) {
				groupItems = [];
				groupsMap.set(group, groupItems);
			}
			groupItems.push(item);
		}
	}

	return Array.from(groupsMap.entries()).map(([group, items]) => ({
		group,
		items,
	}));
}
