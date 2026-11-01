import { describe, expect, it } from "bun:test";
import { findCueIndexAtCaret, parseCues } from "./cues";

describe("parseCues", () => {
	it("returns empty array for null or undefined", () => {
		expect(parseCues(null)).toEqual([]);
		expect(parseCues(undefined)).toEqual([]);
		expect(parseCues()).toEqual([]);
	});

	it("returns empty array for empty string", () => {
		expect(parseCues("")).toEqual([]);
	});

	it("returns empty array for whitespace-only string", () => {
		expect(parseCues("   \n\t  \n  ")).toEqual([]);
	});

	it("parses single block and trims whitespace", () => {
		expect(parseCues("  Hello world  ")).toEqual(["Hello world"]);
	});

	it("preserves internal line breaks within a block", () => {
		const content = "Line 1\nLine 2\nLine 3";
		expect(parseCues(content)).toEqual(["Line 1\nLine 2\nLine 3"]);
	});

	it("splits multiple blocks separated by blank lines and trims each block", () => {
		const content = `
      Verse 1 Line 1
      Verse 1 Line 2

      Chorus Line 1
      Chorus Line 2
    `;
		expect(parseCues(content)).toEqual([
			"Verse 1 Line 1\n      Verse 1 Line 2",
			"Chorus Line 1\n      Chorus Line 2",
		]);
	});

	it("handles consecutive blank lines without creating empty cues", () => {
		const content = "Verse 1\n\n\n\nVerse 2\n\n   \n\nVerse 3";
		expect(parseCues(content)).toEqual(["Verse 1", "Verse 2", "Verse 3"]);
	});

	it("handles leading and trailing blank lines cleanly", () => {
		const content = "\n\n   \nVerse 1\n\nVerse 2\n\n\n";
		expect(parseCues(content)).toEqual(["Verse 1", "Verse 2"]);
	});
});

describe("findCueIndexAtCaret", () => {
	it("returns 0 for null, undefined, empty, or whitespace string", () => {
		expect(findCueIndexAtCaret(null, 0)).toBe(0);
		expect(findCueIndexAtCaret(undefined, 0)).toBe(0);
		expect(findCueIndexAtCaret("", 0)).toBe(0);
		expect(findCueIndexAtCaret("   \n\n  ", 5)).toBe(0);
	});

	it("handles negative or past-the-end caret offsets", () => {
		const content = "Verse 1\n\nVerse 2";
		expect(findCueIndexAtCaret(content, -5)).toBe(0);
		expect(findCueIndexAtCaret(content, 100)).toBe(1);
	});

	it("resolves caret inside first, middle, and last cues", () => {
		const content = "Verse 1\n\nVerse 2\n\nVerse 3";
		// Verse 1 is [0, 7]
		expect(findCueIndexAtCaret(content, 0)).toBe(0);
		expect(findCueIndexAtCaret(content, 3)).toBe(0);
		expect(findCueIndexAtCaret(content, 7)).toBe(0);

		// Verse 2 is [9, 16]
		expect(findCueIndexAtCaret(content, 9)).toBe(1);
		expect(findCueIndexAtCaret(content, 12)).toBe(1);
		expect(findCueIndexAtCaret(content, 16)).toBe(1);

		// Verse 3 is [18, 25]
		expect(findCueIndexAtCaret(content, 18)).toBe(2);
		expect(findCueIndexAtCaret(content, 22)).toBe(2);
		expect(findCueIndexAtCaret(content, 25)).toBe(2);
	});

	it("clamps caret on blank lines between cues to the nearest cue index", () => {
		// "Verse 1\n\n\n\nVerse 2"
		// Verse 1 ends at index 7. Blank lines are index 7 to 11.
		// Verse 2 starts at index 11.
		const content = "Verse 1\n\n\n\nVerse 2";
		// Offset 8 is closer to Verse 1 (end 7, dist 1) than Verse 2 (start 11, dist 3) -> 0
		expect(findCueIndexAtCaret(content, 8)).toBe(0);
		// Offset 10 is closer to Verse 2 (dist 1) than Verse 1 (dist 3) -> 1
		expect(findCueIndexAtCaret(content, 10)).toBe(1);
		// Offset 9 is equidistant (dist 2 vs 2) -> clamps to earlier (0)
		expect(findCueIndexAtCaret(content, 9)).toBe(0);
	});

	it("handles leading and trailing blank lines", () => {
		const content = "\n\nVerse 1\n\nVerse 2\n\n";
		// Leading blank line: before Verse 1
		expect(findCueIndexAtCaret(content, 0)).toBe(0);
		expect(findCueIndexAtCaret(content, 1)).toBe(0);
		// Trailing blank line: after Verse 2
		expect(findCueIndexAtCaret(content, content.length)).toBe(1);
		expect(findCueIndexAtCaret(content, content.length - 1)).toBe(1);
	});
});
