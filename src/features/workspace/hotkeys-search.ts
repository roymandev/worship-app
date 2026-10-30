export type AppHotkeyItem = {
	id: string;
	hotkey?: string | readonly string[] | string[] | null;
	name?: string;
	description?: string;
	group?: string;
	meta?: {
		name?: string;
		description?: string;
		group?: string;
		[key: string]: unknown;
	};
	[key: string]: unknown;
};

export type AppHotkeyCatalogInput =
	| AppHotkeyItem[]
	| {
			[key: string]: {
				hotkey?: unknown;
				meta?: unknown;
				[key: string]: unknown;
			};
	  }
	| object;

function normalizeCatalog(catalog: AppHotkeyCatalogInput): AppHotkeyItem[] {
	if (Array.isArray(catalog)) {
		return catalog;
	}

	return Object.entries(catalog).map(([key, rawValue]) => {
		if (rawValue && typeof rawValue === "object") {
			const item = rawValue as {
				id?: unknown;
				name?: unknown;
				description?: unknown;
				group?: unknown;
				hotkey?: unknown;
				meta?: unknown;
			};
			const rawMeta = item.meta as
				| { name?: unknown; description?: unknown; group?: unknown }
				| undefined;
			return {
				id: typeof item.id === "string" ? item.id : key,
				hotkey:
					typeof item.hotkey === "string" || Array.isArray(item.hotkey)
						? (item.hotkey as string | string[] | readonly string[])
						: null,
				name:
					typeof item.name === "string"
						? item.name
						: typeof rawMeta?.name === "string"
							? rawMeta.name
							: undefined,
				description:
					typeof item.description === "string"
						? item.description
						: typeof rawMeta?.description === "string"
							? rawMeta.description
							: undefined,
				group:
					typeof item.group === "string"
						? item.group
						: typeof rawMeta?.group === "string"
							? rawMeta.group
							: undefined,
				meta: rawMeta as AppHotkeyItem["meta"],
			};
		}
		return { id: key };
	});
}

function getHotkeySearchString(
	hotkey: AppHotkeyItem["hotkey"] | undefined,
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

function normalizeSearchTerm(term: string): string {
	return term
		.toLowerCase()
		.replace(/\b(cmd|command)\b/g, "mod")
		.replace(/\b(ctrl|control)\b/g, "mod");
}

export function filterHotkeys(
	catalog: AppHotkeyCatalogInput,
	query: string,
): AppHotkeyItem[] {
	const items = normalizeCatalog(catalog);
	const rawQuery = query.trim().toLowerCase();

	if (!rawQuery) {
		return items;
	}

	const normalizedQuery = normalizeSearchTerm(rawQuery);

	return items.filter((item) => {
		const name = (item.name ?? item.meta?.name ?? "").toLowerCase();
		const description = (
			item.description ??
			item.meta?.description ??
			""
		).toLowerCase();
		const group = (item.group ?? item.meta?.group ?? "").toLowerCase();
		const hotkeyStr = getHotkeySearchString(item.hotkey).toLowerCase();
		const normalizedHotkeyStr = normalizeSearchTerm(hotkeyStr);

		return (
			name.includes(rawQuery) ||
			description.includes(rawQuery) ||
			group.includes(rawQuery) ||
			hotkeyStr.includes(rawQuery) ||
			normalizedHotkeyStr.includes(normalizedQuery)
		);
	});
}

export function groupHotkeys(
	items: AppHotkeyItem[],
): Record<string, AppHotkeyItem[]> {
	const groups: Record<string, AppHotkeyItem[]> = {};

	for (const item of items) {
		const group = item.group || item.meta?.group || "General";
		if (!groups[group]) {
			groups[group] = [];
		}
		groups[group].push(item);
	}

	return groups;
}
