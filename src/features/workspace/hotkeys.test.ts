import { describe, expect, it } from "bun:test";
import { appHotkeys, searchHotkeys } from "./hotkeys";

describe("searchHotkeys", () => {
	it("returns all hotkeys as structured items when query is empty", () => {
		const results = searchHotkeys("");
		const expectedCount = Object.keys(appHotkeys).length;

		expect(results).toHaveLength(expectedCount);
		for (const result of results) {
			expect(result).toHaveProperty("id");
			expect(result).toHaveProperty("group");
			expect(result).toHaveProperty("name");
			expect(result).toHaveProperty("description");
			expect(result).toHaveProperty("hotkey");
			expect(typeof result.hotkey).toBe("string");
		}
	});

	it("returns raw hotkey chord metadata", () => {
		const results = searchHotkeys("Toggle layout mode");
		expect(results.length).toBeGreaterThan(0);
		const result = results.find((r) => r.id === "workspace.toggleLayoutMode");
		expect(result).toBeDefined();
		expect(result?.hotkey).toBe("Mod+E");
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
		const results = searchHotkeys("Mod+Shift+C");
		expect(results).toHaveLength(1);
		expect(results[0].id).toBe("presentation.toggleClear");
	});

	it("returns empty array when query does not match any hotkey", () => {
		const results = searchHotkeys("nonexistent-action-xyz");
		expect(results).toEqual([]);
	});
});
