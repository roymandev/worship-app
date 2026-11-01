import { IconDeviceTv } from "@tabler/icons-react";
import { findCueIndexAtCaret, parseCues } from "@/features/playlist/cues";
import {
	type PlaylistState,
	usePlaylistStore,
} from "@/features/playlist/store";

export function selectPreviewDisplayText(state: PlaylistState): string | null {
	if (state.previewDraft !== null) {
		const cues = parseCues(state.previewDraft.content);
		const activeCueIndex = findCueIndexAtCaret(
			state.previewDraft.content,
			state.previewDraft.caretOffset,
		);
		return cues[activeCueIndex] ?? null;
	}

	if (state.selectedItemId === null || state.selectedCueIndex === null) {
		return null;
	}

	const selectedItem = state.items.find((i) => i.id === state.selectedItemId);
	if (!selectedItem) {
		return null;
	}

	const cues = parseCues(selectedItem.content);
	return cues[state.selectedCueIndex] ?? null;
}

export function PreviewScreenPanel() {
	const displayText = usePlaylistStore(selectPreviewDisplayText);

	return (
		<section
			aria-label="Preview screen panel"
			className="flex h-full w-full flex-col overflow-hidden bg-background text-foreground"
		>
			<header className="flex h-10 shrink-0 items-center gap-2 border-b px-3">
				<IconDeviceTv className="size-4 text-muted-foreground" />
				<h2 className="truncate font-semibold text-sm">Preview</h2>
			</header>

			<div className="@container [container-type:size] flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-muted/20 p-3">
				<section
					aria-label="Preview canvas"
					className="flex aspect-video w-[min(100%,calc(100cqh*16/9))] max-h-full max-w-full items-center justify-center overflow-hidden rounded-sm bg-black p-[clamp(0.75rem,2.5cqw,1.5rem)] text-center text-white select-none"
				>
					{displayText ? (
						<p className="break-words font-medium text-[clamp(0.875rem,3.5cqw,1.25rem)] leading-relaxed whitespace-pre-line">
							{displayText}
						</p>
					) : null}
				</section>
			</div>
		</section>
	);
}
