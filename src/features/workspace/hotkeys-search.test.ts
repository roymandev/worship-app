import { describe, expect, it } from "bun:test";
import {
	type AppHotkeyItem,
	filterHotkeys,
	groupHotkeys,
} from "./hotkeys-search";

describe("filterHotkeys", () => {
	const sampleCatalog: AppHotkeyItem[] = [
		{
			id: "toggle-mode",
			name: "Toggle Edit Mode",
			description: "Switch between view and edit layout mode",
			group: "Workspace",
			hotkey: "Mod+E",
		},
		{
			id: "reset-layout",
			name: "Reset Layout",
			description: "Restore panels to default sizes",
			group: "Workspace",
			hotkey: ["Mod+Shift+R"],
		},
		{
			id: "open-cheatsheet",
			name: "Keyboard Shortcuts",
			description: "Open cheatsheet modal",
			group: "General",
			hotkey: "Mod+/",
		},
	];

	it("returns all items when query is empty or whitespace", () => {
		expect(filterHotkeys(sampleCatalog, "")).toEqual(sampleCatalog);
		expect(filterHotkeys(sampleCatalog, "   ")).toEqual(sampleCatalog);
	});

	it("matches hotkeys by label/name case-insensitively with whitespace trimmed", () => {
		const results = filterHotkeys(sampleCatalog, "  TOGGLE  ");
		expect(results).toHaveLength(1);
		expect(results[0]?.id).toBe("toggle-mode");
	});

	it("matches hotkeys by description case-insensitively", () => {
		const results = filterHotkeys(sampleCatalog, "restore panels");
		expect(results).toHaveLength(1);
		expect(results[0]?.id).toBe("reset-layout");
	});

	it("matches hotkeys by group name", () => {
		const results = filterHotkeys(sampleCatalog, "general");
		expect(results).toHaveLength(1);
		expect(results[0]?.id).toBe("open-cheatsheet");
	});

	it("matches hotkeys by key combo with modifier aliases (cmd/command/ctrl/control)", () => {
		expect(filterHotkeys(sampleCatalog, "ctrl+e")).toHaveLength(1);
		expect(filterHotkeys(sampleCatalog, "control+e")).toHaveLength(1);
		expect(filterHotkeys(sampleCatalog, "Cmd+E")).toHaveLength(1);
		expect(filterHotkeys(sampleCatalog, "command+e")).toHaveLength(1);
		expect(filterHotkeys(sampleCatalog, "ctrl+shift+r")).toHaveLength(1);
	});

	it("returns empty array when query does not match any hotkey", () => {
		const results = filterHotkeys(sampleCatalog, "nonexistent query xyz");
		expect(results).toEqual([]);
	});

	describe("dictionary catalogs and fallback resolution", () => {
		it("normalizes dictionary-shaped catalog inputs with nested meta properties", () => {
			const dictionaryCatalog = {
				"action-one": {
					hotkey: "Mod+K",
					meta: {
						name: "Command Palette",
						description: "Open the quick action palette",
						group: "Navigation",
					},
				},
				"action-two": {
					hotkey: ["Mod+P"],
					meta: {
						name: "Quick Open",
						description: "Go to file",
						group: "Navigation",
					},
				},
			};

			const allItems = filterHotkeys(dictionaryCatalog, "");
			expect(allItems).toEqual([
				{
					id: "action-one",
					hotkey: "Mod+K",
					name: "Command Palette",
					description: "Open the quick action palette",
					group: "Navigation",
					meta: {
						name: "Command Palette",
						description: "Open the quick action palette",
						group: "Navigation",
					},
				},
				{
					id: "action-two",
					hotkey: ["Mod+P"],
					name: "Quick Open",
					description: "Go to file",
					group: "Navigation",
					meta: {
						name: "Quick Open",
						description: "Go to file",
						group: "Navigation",
					},
				},
			]);
		});

		it("gives top-level properties precedence over meta fallbacks", () => {
			const catalogWithOverrides = {
				action: {
					id: "custom-id",
					name: "Explicit Name",
					description: "Explicit Description",
					group: "Explicit Group",
					hotkey: "Mod+Shift+P",
					meta: {
						name: "Meta Name",
						description: "Meta Description",
						group: "Meta Group",
					},
				},
			};

			const [item] = filterHotkeys(catalogWithOverrides, "");
			expect(item?.id).toBe("custom-id");
			expect(item?.name).toBe("Explicit Name");
			expect(item?.description).toBe("Explicit Description");
			expect(item?.group).toBe("Explicit Group");

			// Matches top-level query values
			expect(filterHotkeys(catalogWithOverrides, "Explicit Name")).toHaveLength(
				1,
			);
			expect(
				filterHotkeys(catalogWithOverrides, "Explicit Description"),
			).toHaveLength(1);
			expect(
				filterHotkeys(catalogWithOverrides, "Explicit Group"),
			).toHaveLength(1);

			// Overridden meta values are not matched
			expect(filterHotkeys(catalogWithOverrides, "Meta Name")).toHaveLength(0);
			expect(
				filterHotkeys(catalogWithOverrides, "Meta Description"),
			).toHaveLength(0);
			expect(filterHotkeys(catalogWithOverrides, "Meta Group")).toHaveLength(0);
		});

		it("preserves explicit ID when present and falls back to dictionary key when omitted or non-string", () => {
			const catalog = {
				"key-with-explicit-id": {
					id: "explicit-id-123",
					name: "Explicit ID Item",
				},
				"key-without-id": {
					name: "Implicit ID Item",
				},
				"key-with-non-string-id": {
					id: 999,
					name: "Non-String ID Item",
				},
			};

			const items = filterHotkeys(catalog, "");
			expect(items[0]?.id).toBe("explicit-id-123");
			expect(items[1]?.id).toBe("key-without-id");
			expect(items[2]?.id).toBe("key-with-non-string-id");
		});

		it("safely handles non-object and degenerate entries in dictionary catalogs", () => {
			const degenerateCatalog = {
				"valid-item": {
					name: "Valid Item",
				},
				"null-item": null,
				"bool-item": false,
				"number-item": 12345,
				"string-item": "unexpected string",
				"undefined-item": undefined,
			};

			const items = filterHotkeys(degenerateCatalog, "");
			expect(items).toHaveLength(6);
			expect(items[1]).toEqual({ id: "null-item" });
			expect(items[2]).toEqual({ id: "bool-item" });
			expect(items[3]).toEqual({ id: "number-item" });
			expect(items[4]).toEqual({ id: "string-item" });
			expect(items[5]).toEqual({ id: "undefined-item" });

			// Filter still functions properly
			const filtered = filterHotkeys(degenerateCatalog, "Valid");
			expect(filtered).toHaveLength(1);
			expect(filtered[0]?.id).toBe("valid-item");
		});

		it("safely handles non-string and non-array hotkeys without throwing", () => {
			const malformedHotkeys = {
				"null-hotkey": {
					name: "Item with null hotkey",
					hotkey: null,
				},
				"undefined-hotkey": {
					name: "Item with undefined hotkey",
					hotkey: undefined,
				},
				"number-hotkey": {
					name: "Item with number hotkey",
					hotkey: 42,
				},
				"object-hotkey": {
					name: "Item with object hotkey",
					hotkey: { key: "invalid" },
				},
			};

			const items = filterHotkeys(malformedHotkeys, "");
			expect(items[0]?.hotkey).toBeNull();
			expect(items[1]?.hotkey).toBeNull();
			expect(items[2]?.hotkey).toBeNull();
			expect(items[3]?.hotkey).toBeNull();

			// Can still search by name without crashing
			const result = filterHotkeys(malformedHotkeys, "object hotkey");
			expect(result).toHaveLength(1);
			expect(result[0]?.id).toBe("object-hotkey");
		});

		it("matches queries against fields defined exclusively in meta", () => {
			const metaOnlyCatalog = {
				"search-meta-desc": {
					meta: {
						name: "Only In Meta Name",
						description: "Special meta description target",
						group: "MetaCategoryGroup",
					},
				},
			};

			expect(
				filterHotkeys(metaOnlyCatalog, "meta description target"),
			).toHaveLength(1);
			expect(filterHotkeys(metaOnlyCatalog, "MetaCategoryGroup")).toHaveLength(
				1,
			);
			expect(filterHotkeys(metaOnlyCatalog, "Only In Meta Name")).toHaveLength(
				1,
			);
		});

		it("handles dictionary items where top-level and meta fields are non-string types", () => {
			const invalidFieldTypesCatalog = {
				item: {
					name: 123,
					description: true,
					group: {},
					meta: {
						name: null,
						description: "Valid fallback description",
						group: "Valid fallback group",
					},
				},
			};

			const items = filterHotkeys(invalidFieldTypesCatalog, "");
			expect(items[0]?.name).toBeUndefined();
			expect(items[0]?.description).toBe("Valid fallback description");
			expect(items[0]?.group).toBe("Valid fallback group");

			// Search matches on the valid meta fallback
			expect(
				filterHotkeys(invalidFieldTypesCatalog, "fallback description"),
			).toHaveLength(1);
		});

		it("matches dictionary catalog items by modifier aliases (cmd/ctrl)", () => {
			const dictionaryCatalog = {
				"action-cmd": {
					hotkey: "Mod+K",
					meta: { name: "Command Palette" },
				},
				"action-ctrl": {
					hotkey: ["Mod+P"],
					meta: { name: "Quick Open" },
				},
			};

			const cmdResults = filterHotkeys(dictionaryCatalog, "cmd+k");
			expect(cmdResults).toHaveLength(1);
			expect(cmdResults[0]?.id).toBe("action-cmd");

			const ctrlResults = filterHotkeys(dictionaryCatalog, "ctrl+p");
			expect(ctrlResults).toHaveLength(1);
			expect(ctrlResults[0]?.id).toBe("action-ctrl");
		});

		it("matches dictionary catalog items with padded whitespace queries", () => {
			const dictionaryCatalog = {
				"action-one": {
					hotkey: "Mod+K",
					meta: {
						name: "Command Palette",
						description: "Open the quick action palette",
					},
				},
			};

			const results = filterHotkeys(dictionaryCatalog, "   Command Palette   ");
			expect(results).toHaveLength(1);
			expect(results[0]?.id).toBe("action-one");
		});

		it("filters unmapped shortcuts without assigned hotkey by description as well as name", () => {
			const dictionaryCatalog = {
				"unmapped-action": {
					hotkey: null,
					meta: {
						name: "Export Workspace",
						description: "Download workspace backup file",
					},
				},
			};

			const byName = filterHotkeys(dictionaryCatalog, "Export Workspace");
			expect(byName).toHaveLength(1);
			expect(byName[0]?.id).toBe("unmapped-action");

			const byDescription = filterHotkeys(dictionaryCatalog, "backup file");
			expect(byDescription).toHaveLength(1);
			expect(byDescription[0]?.id).toBe("unmapped-action");
		});

		it("safely extracts key combinations when catalog items contain unexpected hotkey types", () => {
			// Array catalogs bypass normalizeCatalog, passing items directly to getHotkeySearchString
			const arrayCatalogWithUnexpectedHotkey = [
				{
					id: "unexpected-hotkey-type",
					name: "Item with Number Hotkey",
					hotkey: 12345 as unknown as string,
				},
			];

			const results = filterHotkeys(
				arrayCatalogWithUnexpectedHotkey,
				"Item with Number Hotkey",
			);
			expect(results).toHaveLength(1);
			expect(results[0]?.id).toBe("unexpected-hotkey-type");
		});
	});
});

describe("groupHotkeys", () => {
	it("returns empty object when given an empty list", () => {
		expect(groupHotkeys([])).toEqual({});
	});

	it("groups hotkeys into categories and preserves items", () => {
		const items: AppHotkeyItem[] = [
			{ id: "1", name: "First", group: "Workspace" },
			{ id: "2", name: "Second", group: "Workspace" },
			{ id: "3", name: "Third", group: "Navigation" },
			{ id: "4", name: "Fourth" }, // default to General
		];

		const grouped = groupHotkeys(items);
		expect(Object.keys(grouped)).toEqual([
			"Workspace",
			"Navigation",
			"General",
		]);
		expect(grouped.Workspace).toHaveLength(2);
		expect(grouped.Navigation).toHaveLength(1);
		expect(grouped.General).toHaveLength(1);
	});

	it("resolves group from meta when item group is omitted", () => {
		const items: AppHotkeyItem[] = [
			{
				id: "meta-group-item",
				meta: { group: "MetaGroup" },
			},
			{
				id: "explicit-group-item",
				group: "ExplicitGroup",
				meta: { group: "MetaGroup" },
			},
		];

		const grouped = groupHotkeys(items);
		expect(grouped.MetaGroup).toHaveLength(1);
		expect(grouped.MetaGroup?.[0]?.id).toBe("meta-group-item");
		expect(grouped.ExplicitGroup).toHaveLength(1);
		expect(grouped.ExplicitGroup?.[0]?.id).toBe("explicit-group-item");
	});
});
