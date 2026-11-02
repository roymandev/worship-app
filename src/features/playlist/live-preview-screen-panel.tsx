import { IconDeviceTv } from "@tabler/icons-react";
import { parseCues } from "@/features/playlist/cues";
import { PreviewCanvas } from "@/features/playlist/preview-canvas";
import {
	type PlaylistState,
	usePlaylistStore,
} from "@/features/playlist/store";

export function selectLiveDisplayText(state: PlaylistState): string | null {
	if (state.liveItemId === null || state.liveCueIndex === null) {
		return null;
	}

	const liveItem = state.items.find((i) => i.id === state.liveItemId);
	if (!liveItem) {
		return null;
	}

	const cues = parseCues(liveItem.content);
	return cues[state.liveCueIndex] ?? null;
}

export function LivePreviewScreenPanel() {
	const displayText = usePlaylistStore(selectLiveDisplayText);

	return (
		<section
			aria-label="Live preview screen panel"
			className="flex h-full w-full flex-col overflow-hidden bg-background text-foreground"
		>
			<header className="flex h-10 shrink-0 items-center gap-2 border-b px-3">
				<IconDeviceTv className="size-4 text-muted-foreground" />
				<h2 className="truncate font-semibold text-sm">Live</h2>
			</header>

			<div className="@container [container-type:size] flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-muted/20 p-3">
				<PreviewCanvas text={displayText} variant="live" />
			</div>
		</section>
	);
}
