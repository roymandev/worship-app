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
});
