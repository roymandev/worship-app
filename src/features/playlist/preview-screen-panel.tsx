import { IconDeviceTv } from "@tabler/icons-react";
import { parseCues } from "@/features/playlist/cues";
import {
	selectDraftDisplayText,
	useEditorDraftStore,
} from "@/features/playlist/editor-draft-store";
import { PreviewCanvas } from "@/features/playlist/preview-canvas";
import {
	type PlaylistState,
	usePlaylistStore,
} from "@/features/playlist/store";

export function selectPreviewDisplayText(state: PlaylistState): string | null {
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
	const activeEditingItemId = usePlaylistStore((state) => state.editingItemId);
	const draftContent = useEditorDraftStore((state) => state.draftContent);
	const caretOffset = useEditorDraftStore((state) => state.caretOffset);
	const activeCueText = usePlaylistStore(selectPreviewDisplayText);

	const displayText =
		activeEditingItemId !== null && draftContent !== null
			? selectDraftDisplayText(draftContent, caretOffset)
			: activeCueText;

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
				<PreviewCanvas text={displayText} variant="stage" />
			</div>
		</section>
	);
}
