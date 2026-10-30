import { describe, expect, it } from "bun:test";
import { appHotkeys, searchHotkeys } from "./hotkeys";

describe("searchHotkeys", () => {
	it("returns all hotkeys as structured items when query is empty", () => {
		const results = searchHotkeys("", true);
		const expectedCount = Object.keys(appHotkeys).length;

		expect(results).toHaveLength(expectedCount);
		for (const result of results) {
			expect(result).toHaveProperty("id");
			expect(result).toHaveProperty("group");
			expect(result).toHaveProperty("name");
			expect(result).toHaveProperty("description");
			expect(result).toHaveProperty("formattedChord");
			expect(typeof result.formattedChord).toBe("string");
		}
	});

	it("formats chords with Mac symbols when isMac is true", () => {
		const results = searchHotkeys("Toggle layout mode", true);
		expect(results.length).toBeGreaterThan(0);
		const result = results.find((r) => r.id === "workspace.toggleLayoutMode");
		expect(result).toBeDefined();
		expect(result?.formattedChord).toBe("⌘ E");
	});

	it("formats chords with Standard/Windows symbols when isMac is false", () => {
		const results = searchHotkeys("Toggle layout mode", false);
		const result = results.find((r) => r.id === "workspace.toggleLayoutMode");
		expect(result).toBeDefined();
		expect(result?.formattedChord).toBe("Ctrl + E");
	});

	it("filters by hotkey name case-insensitively", () => {
		const results = searchHotkeys("blackout");
		expect(results).toHaveLength(1);
		expect(results[0].id).toBe("presentation.toggleBlackout");
	});

	it("filters by hotkey group name", () => {
		const results = searchHotkeys("Presentation");
		expect(results.length).toBeGreaterThanOrEqual(2);
		expect(results.every((r) => r.group === "Presentation")).toBe(true);
	});

	it("filters by hotkey chord notation", () => {
		const results = searchHotkeys("Mod+Enter");
		expect(results).toHaveLength(1);
		expect(results[0].id).toBe("presentation.goLive");
	});

	it("returns empty array when query does not match any hotkey", () => {
		const results = searchHotkeys("nonexistent-action-xyz");
		expect(results).toEqual([]);
	});
});
