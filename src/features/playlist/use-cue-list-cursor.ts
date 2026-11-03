import { useCallback } from "react";
import { usePlaylistStore } from "@/features/playlist/store";

export function useCueListCursor(target: "stage" | "live") {
	const itemId = usePlaylistStore((s) =>
		target === "stage" ? s.selectedItemId : s.liveItemId,
	);
	const cueIndex = usePlaylistStore((s) =>
		target === "stage" ? s.selectedCueIndex : s.liveCueIndex,
	);
	const storeSelectCue = usePlaylistStore((s) => s.selectCue);
	const storeNavigateCue = usePlaylistStore((s) => s.navigateCue);

	const selectCue = useCallback(
		(index: number | null) => storeSelectCue(target, index),
		[storeSelectCue, target],
	);

	const navigateCue = useCallback(
		(direction: "prev" | "next" | "first" | "last") =>
			storeNavigateCue(target, direction),
		[storeNavigateCue, target],
	);

	return {
		itemId,
		cueIndex,
		selectCue,
		navigateCue,
	};
}
