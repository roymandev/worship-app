import { describe, expect, it } from "bun:test";
import { parseCues } from "./cues";

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
