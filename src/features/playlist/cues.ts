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

/**
 * Finds the index of the cue block at a given caret offset.
 * Parses content into cue blocks using blank line delimiters (/\n\s*\n+/).
 * If caret is on blank lines between cues or past the end, clamps to the nearest cue index.
 * Returns 0 if content is empty or no cues exist.
 */
export function findCueIndexAtCaret(
	content: string | null | undefined,
	caretOffset: number,
): number {
	if (!content || !content.trim()) {
		return 0;
	}

	const delimiterRegex = /\n\s*\n+/g;
	const blocks: { start: number; end: number; hasContent: boolean }[] = [];
	let lastIndex = 0;
	let match: RegExpExecArray | null = delimiterRegex.exec(content);

	while (match !== null) {
		const start = lastIndex;
		const end = match.index;
		const text = content.slice(start, end);
		if (text.trim().length > 0) {
			blocks.push({ start, end, hasContent: true });
		}
		lastIndex = delimiterRegex.lastIndex;
		match = delimiterRegex.exec(content);
	}

	// Trailing block after the last delimiter
	const trailingText = content.slice(lastIndex);
	if (trailingText.trim().length > 0) {
		blocks.push({ start: lastIndex, end: content.length, hasContent: true });
	}

	if (blocks.length === 0) {
		return 0;
	}

	// If caret is before or at the start of the first cue block
	if (caretOffset <= blocks[0].start) {
		return 0;
	}

	// If caret is at or after the end of the last cue block
	if (caretOffset >= blocks[blocks.length - 1].end) {
		return blocks.length - 1;
	}

	// Check if caret falls inside a block or between blocks
	for (let i = 0; i < blocks.length; i++) {
		const block = blocks[i];
		if (caretOffset >= block.start && caretOffset <= block.end) {
			return i;
		}
		// If caret is between this block and the next block
		if (i < blocks.length - 1) {
			const nextBlock = blocks[i + 1];
			if (caretOffset > block.end && caretOffset < nextBlock.start) {
				// Clamps to nearest cue index based on distance to block.end vs nextBlock.start
				const distToPrev = caretOffset - block.end;
				const distToNext = nextBlock.start - caretOffset;
				return distToPrev <= distToNext ? i : i + 1;
			}
		}
	}

	return 0;
}
