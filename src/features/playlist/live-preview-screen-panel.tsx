import { IconDeviceTv, IconEraser, IconEyeOff } from "@tabler/icons-react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
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
	const { isLiveClear, isLiveBlackout, toggleLiveClear, toggleLiveBlackout } =
		usePlaylistStore(
			useShallow((s) => ({
				isLiveClear: s.isLiveClear,
				isLiveBlackout: s.isLiveBlackout,
				toggleLiveClear: s.toggleLiveClear,
				toggleLiveBlackout: s.toggleLiveBlackout,
			})),
		);

	return (
		<section
			aria-label="Live preview screen panel"
			className="flex h-full w-full flex-col overflow-hidden bg-background text-foreground"
		>
			<header className="flex h-10 shrink-0 items-center gap-2 border-b px-3">
				<IconDeviceTv className="size-4 text-muted-foreground" />
				<h2 className="truncate font-semibold text-sm">Live Preview</h2>
				<div className="ml-auto flex items-center gap-1.5">
					<Button
						variant={isLiveClear ? "default" : "outline"}
						size="sm"
						aria-pressed={isLiveClear}
						title="Clear slide text (Mod+Shift+C)"
						onClick={toggleLiveClear}
						className={
							isLiveClear
								? "border border-amber-600 bg-amber-500 font-medium text-amber-950 hover:bg-amber-400"
								: undefined
						}
					>
						<IconEraser className="size-3.5" />
						Clear
					</Button>
					<Button
						variant={isLiveBlackout ? "default" : "outline"}
						size="sm"
						aria-pressed={isLiveBlackout}
						title="Toggle blackout (Mod+B)"
						onClick={toggleLiveBlackout}
						className={
							isLiveBlackout
								? "border border-red-700 bg-red-600 font-medium text-white hover:bg-red-500"
								: undefined
						}
					>
						<IconEyeOff className="size-3.5" />
						Blackout
					</Button>
				</div>
			</header>

			<div className="@container [container-type:size] flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-muted/20 p-3">
				<PreviewCanvas
					text={displayText}
					variant="live"
					isClear={isLiveClear}
					isBlackout={isLiveBlackout}
				/>
			</div>
		</section>
	);
}
