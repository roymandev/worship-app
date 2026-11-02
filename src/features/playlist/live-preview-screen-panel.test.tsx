import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { act, cleanup, render, screen } from "@testing-library/react";
import {
	LivePreviewScreenPanel,
	selectLiveDisplayText,
} from "./live-preview-screen-panel";
import { usePlaylistStore } from "./store";

describe("LivePreviewScreenPanel", () => {
	beforeEach(() => {
		usePlaylistStore.setState(usePlaylistStore.getInitialState(), true);
	});

	afterEach(() => {
		cleanup();
	});

	it("renders 'Live' header with monitor icon and without counter badge or navigation buttons", () => {
		render(<LivePreviewScreenPanel />);

		expect(screen.getByRole("heading", { name: "Live" })).toBeInTheDocument();
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
		expect(screen.queryByText(/badge|count/i)).not.toBeInTheDocument();
	});

	it("selectLiveDisplayText returns null when liveItemId or liveCueIndex is null", () => {
		const state = usePlaylistStore.getState();
		expect(selectLiveDisplayText(state)).toBeNull();

		expect(
			selectLiveDisplayText({
				...state,
				liveItemId: "item-1",
				liveCueIndex: null,
			}),
		).toBeNull();

		expect(
			selectLiveDisplayText({
				...state,
				liveItemId: null,
				liveCueIndex: 0,
			}),
		).toBeNull();
	});

	it("selectLiveDisplayText returns null when live item is not found", () => {
		const state = usePlaylistStore.getState();
		expect(
			selectLiveDisplayText({
				...state,
				liveItemId: "non-existent-id",
				liveCueIndex: 0,
			}),
		).toBeNull();
	});

	it("displays live cue text when live item and cue index are set", () => {
		usePlaylistStore.setState({
			items: [
				{
					id: "item-1",
					title: "Amazing Grace",
					content: "Verse 1 line 1\nVerse 1 line 2\n\nVerse 2 line 1",
				},
			],
			liveItemId: "item-1",
			liveCueIndex: 1,
		});

		render(<LivePreviewScreenPanel />);

		expect(screen.getByText("Verse 2 line 1")).toBeInTheDocument();
	});

	it("updates displayed text when liveCueIndex changes", () => {
		usePlaylistStore.setState({
			items: [
				{
					id: "item-1",
					title: "Amazing Grace",
					content: "Verse 1 line 1\nVerse 1 line 2\n\nVerse 2 line 1",
				},
			],
			liveItemId: "item-1",
			liveCueIndex: 0,
		});

		render(<LivePreviewScreenPanel />);
		expect(
			screen.getByText((content) => content.includes("Verse 1 line 1")),
		).toBeInTheDocument();

		act(() => {
			usePlaylistStore.setState({ liveCueIndex: 1 });
		});
		expect(screen.getByText("Verse 2 line 1")).toBeInTheDocument();
	});

	it("renders blank screen indicator when no item is live", () => {
		usePlaylistStore.setState({
			items: [],
			liveItemId: null,
			liveCueIndex: null,
		});

		render(<LivePreviewScreenPanel />);

		const canvas = screen.getByRole("region", { name: "Live preview canvas" });
		expect(canvas).toBeInTheDocument();
		expect(screen.getByText("Blank screen")).toBeInTheDocument();
		expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
	});

	it("renders blank screen indicator when live item content is empty", () => {
		usePlaylistStore.setState({
			items: [
				{
					id: "empty-item",
					title: "Empty Item",
					content: "   ",
				},
			],
			liveItemId: "empty-item",
			liveCueIndex: null,
		});

		render(<LivePreviewScreenPanel />);

		const canvas = screen.getByRole("region", { name: "Live preview canvas" });
		expect(canvas).toBeInTheDocument();
		expect(screen.getByText("Blank screen")).toBeInTheDocument();
		expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
	});

	it("does not introduce interactive tab stops", () => {
		render(<LivePreviewScreenPanel />);

		const panel = screen.getByRole("region", {
			name: "Live preview screen panel",
		});
		expect(panel).not.toHaveAttribute("tabindex");

		const canvas = screen.getByRole("region", { name: "Live preview canvas" });
		expect(canvas).not.toHaveAttribute("tabindex");

		expect(screen.queryByRole("button")).not.toBeInTheDocument();
		expect(screen.queryByRole("link")).not.toBeInTheDocument();
		expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
	});
});
