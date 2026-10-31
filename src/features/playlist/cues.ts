/**
 * Pure parsing utility to parse multiline playlist item content into discrete cue slide blocks.
 * Splits on one or more blank lines (empty or whitespace-only lines), trims whitespace
 * on each block, and discards empty blocks.
 */
export function parseCues(content?: string | null): string[] {
	if (!content || !content.trim()) {
		return [];
	}

	return content
		.split(/\n\s*\n+/)
		.map((block) => block.trim())
		.filter((block) => block.length > 0);
}
