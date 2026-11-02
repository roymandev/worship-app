import { describe, expect, it } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import { INITIAL_PLAYLIST_ITEMS, usePlaylistStore } from "./store";
import { useCueListCursor } from "./use-cue-list-cursor";

describe("useCueListCursor", () => {
	it("provides stage cursor state and navigation actions", () => {
		usePlaylistStore.setState({
			items: [...INITIAL_PLAYLIST_ITEMS],
			selectedItemId: "item-1",
			selectedCueIndex: 0,
			liveItemId: "item-2",
			liveCueIndex: 1,
		});

		const { result } = renderHook(() => useCueListCursor("stage"));

		expect(result.current.itemId).toBe("item-1");
		expect(result.current.cueIndex).toBe(0);

		act(() => {
			result.current.navigateCue("next");
		});

		expect(result.current.cueIndex).toBe(1);

		act(() => {
			result.current.selectCue(3);
		});

		expect(result.current.cueIndex).toBe(3);
	});

	it("provides live cursor state and navigation actions", () => {
		usePlaylistStore.setState({
			items: [...INITIAL_PLAYLIST_ITEMS],
			selectedItemId: "item-1",
			selectedCueIndex: 0,
			liveItemId: "item-2",
			liveCueIndex: 1,
		});

		const { result } = renderHook(() => useCueListCursor("live"));

		expect(result.current.itemId).toBe("item-2");
		expect(result.current.cueIndex).toBe(1);

		act(() => {
			result.current.navigateCue("first");
		});

		expect(result.current.cueIndex).toBe(0);
	});
});
