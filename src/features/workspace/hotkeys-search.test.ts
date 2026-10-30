import { describe, expect, it } from "bun:test";
import { appHotkeys } from "./hotkeys";
import { formatChordTokens, queryHotkeyCatalog } from "./hotkeys-search";

describe("queryHotkeyCatalog", () => {
	it("returns all catalog items grouped by category when query is empty or whitespace", () => {
		const allGroups = queryHotkeyCatalog(appHotkeys, "");
		const whitespaceGroups = queryHotkeyCatalog(appHotkeys, "   ");

		expect(allGroups).toEqual(whitespaceGroups);
		expect(allGroups.length).toBeGreaterThan(0);

		const groupNames = allGroups.map((g) => g.group);
		expect(groupNames).toContain("Workspace");
		expect(groupNames).toContain("Presentation");
		expect(groupNames).toContain("Help");

		const totalItems = allGroups.reduce((acc, g) => acc + g.items.length, 0);
		expect(totalItems).toBe(Object.keys(appHotkeys).length);
	});

	it("matches hotkeys by item id case-insensitively", () => {
		const results = queryHotkeyCatalog(appHotkeys, "toggleLayoutMode");
		expect(results).toHaveLength(1);
		expect(results[0]?.group).toBe("Workspace");
		expect(results[0]?.items).toHaveLength(1);
		expect(results[0]?.items[0]?.id).toBe("workspace.toggleLayoutMode");
	});

	it("matches hotkeys by name case-insensitively with whitespace trimmed", () => {
		const results = queryHotkeyCatalog(appHotkeys, "  GO LIVE  ");
		expect(results).toHaveLength(1);
		expect(results[0]?.group).toBe("Presentation");
		expect(results[0]?.items).toHaveLength(1);
		expect(results[0]?.items[0]?.id).toBe("presentation.goLive");
		expect(results[0]?.items[0]?.name).toBe("Go live");
	});

	it("matches hotkeys by description case-insensitively", () => {
		const results = queryHotkeyCatalog(appHotkeys, "restore workspace panels");
		expect(results).toHaveLength(1);
		expect(results[0]?.items[0]?.id).toBe("workspace.resetLayout");
	});

	it("matches hotkeys by category group name", () => {
		const results = queryHotkeyCatalog(appHotkeys, "presentation");
		expect(results).toHaveLength(1);
		expect(results[0]?.group).toBe("Presentation");
		expect(results[0]?.items.length).toBe(3);
		const ids = results[0]?.items.map((i) => i.id);
		expect(ids).toContain("presentation.goLive");
		expect(ids).toContain("presentation.toggleBlackout");
		expect(ids).toContain("presentation.toggleClear");
	});

	it("matches hotkeys by key chord strings with modifier aliases (cmd/command/ctrl/control)", () => {
		const ctrlB = queryHotkeyCatalog(appHotkeys, "ctrl+b");
		expect(ctrlB).toHaveLength(1);
		expect(ctrlB[0]?.items[0]?.id).toBe("presentation.toggleBlackout");

		const cmdB = queryHotkeyCatalog(appHotkeys, "cmd+b");
		expect(cmdB).toHaveLength(1);
		expect(cmdB[0]?.items[0]?.id).toBe("presentation.toggleBlackout");

		const commandShiftR = queryHotkeyCatalog(appHotkeys, "command+shift+r");
		expect(commandShiftR).toHaveLength(1);
		expect(commandShiftR[0]?.items[0]?.id).toBe("workspace.resetLayout");
	});

	it("matches hotkeys by formatted glyph tokens like ⌘ or Ctrl", () => {
		const macGlyphMatches = queryHotkeyCatalog(appHotkeys, "⌘", "mac");
		expect(macGlyphMatches.length).toBeGreaterThan(0);
		const macIds = macGlyphMatches.flatMap((g) => g.items.map((i) => i.id));
		expect(macIds).toContain("presentation.toggleBlackout");

		const ctrlMatches = queryHotkeyCatalog(appHotkeys, "Ctrl", "other");
		expect(ctrlMatches.length).toBeGreaterThan(0);
		const ctrlIds = ctrlMatches.flatMap((g) => g.items.map((i) => i.id));
		expect(ctrlIds).toContain("presentation.toggleBlackout");
	});

	it("returns empty group list when query does not match any hotkey", () => {
		const results = queryHotkeyCatalog(appHotkeys, "nonexistent query xyz");
		expect(results).toEqual([]);
	});

	describe("platform chord token formatting", () => {
		it("formats tokens with macOS glyphs when platform is 'mac'", () => {
			const results = queryHotkeyCatalog(
				appHotkeys,
				"workspace.resetLayout",
				"mac",
			);
			expect(results).toHaveLength(1);
			const item = results[0]?.items[0];
			expect(item?.chordTokens).toEqual([["⌘", "⇧", "R"]]);
			expect(item?.formattedTokens).toEqual(["⌘", "⇧", "R"]);
		});

		it("formats tokens with standard labels when platform is 'other'", () => {
			const results = queryHotkeyCatalog(
				appHotkeys,
				"workspace.resetLayout",
				"other",
			);
			expect(results).toHaveLength(1);
			const item = results[0]?.items[0];
			expect(item?.chordTokens).toEqual([["Ctrl", "Shift", "R"]]);
			expect(item?.formattedTokens).toEqual(["Ctrl", "Shift", "R"]);
		});

		it("handles Alt and Ctrl glyphs for mac vs other", () => {
			expect(formatChordTokens("Mod+Alt+B", "mac")).toEqual([["⌘", "⌥", "B"]]);
			expect(formatChordTokens("Mod+Alt+B", "other")).toEqual([
				["Ctrl", "Alt", "B"],
			]);
			expect(formatChordTokens("Ctrl+Enter", "mac")).toEqual([["⌃", "↵"]]);
			expect(formatChordTokens("Ctrl+Enter", "other")).toEqual([
				["Ctrl", "Enter"],
			]);
		});

		it("handles array sequences", () => {
			const tokens = formatChordTokens(["Mod+K", "Mod+P"], "mac");
			expect(tokens).toEqual([
				["⌘", "K"],
				["⌘", "P"],
			]);
		});

		it("handles null or empty hotkey values gracefully", () => {
			expect(formatChordTokens(null, "mac")).toEqual([]);
			expect(formatChordTokens(undefined, "mac")).toEqual([]);
			expect(formatChordTokens("", "mac")).toEqual([]);
		});
	});
});
