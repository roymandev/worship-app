import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

	it("renders 'Live Preview' header with monitor icon and Clear/Blackout action buttons", () => {
		render(<LivePreviewScreenPanel />);

		expect(
			screen.getByRole("heading", { name: "Live Preview" }),
		).toBeInTheDocument();

		const clearBtn = screen.getByRole("button", { name: /clear/i });
		expect(clearBtn).toBeInTheDocument();
		expect(clearBtn).toHaveAttribute("title", "Clear slide text (Mod+Shift+C)");
		expect(clearBtn).toHaveAttribute("aria-pressed", "false");
		expect(clearBtn.querySelector("svg")).toBeInTheDocument();

		const blackoutBtn = screen.getByRole("button", { name: /blackout/i });
		expect(blackoutBtn).toBeInTheDocument();
		expect(blackoutBtn).toHaveAttribute("title", "Toggle blackout (Mod+B)");
		expect(blackoutBtn).toHaveAttribute("aria-pressed", "false");
		expect(blackoutBtn.querySelector("svg")).toBeInTheDocument();

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

	it("toggles Clear state, updates aria-pressed and passes isClear to canvas", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({
			items: [
				{
					id: "item-1",
					title: "Amazing Grace",
					content: "Verse 1 line 1\n\nVerse 2 line 1",
				},
			],
			liveItemId: "item-1",
			liveCueIndex: 0,
		});

		render(<LivePreviewScreenPanel />);

		const clearBtn = screen.getByRole("button", { name: /clear/i });
		expect(clearBtn).toHaveAttribute("aria-pressed", "false");
		expect(clearBtn).not.toHaveClass("bg-amber-500");
		expect(screen.getByText("Verse 1 line 1")).toBeInTheDocument();
		expect(
			screen.queryByText("Output text is cleared"),
		).not.toBeInTheDocument();

		await user.click(clearBtn);

		expect(usePlaylistStore.getState().isLiveClear).toBe(true);
		expect(clearBtn).toHaveAttribute("aria-pressed", "true");
		expect(clearBtn).toHaveClass("bg-amber-500");
		expect(screen.queryByText("Verse 1 line 1")).not.toBeInTheDocument();
		expect(screen.getByText("Output text is cleared")).toBeInTheDocument();

		await user.click(clearBtn);

		expect(usePlaylistStore.getState().isLiveClear).toBe(false);
		expect(clearBtn).toHaveAttribute("aria-pressed", "false");
		expect(clearBtn).not.toHaveClass("bg-amber-500");
		expect(screen.getByText("Verse 1 line 1")).toBeInTheDocument();
		expect(
			screen.queryByText("Output text is cleared"),
		).not.toBeInTheDocument();
	});

	it("toggles Blackout state, updates aria-pressed and passes isBlackout to canvas", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({
			items: [
				{
					id: "item-1",
					title: "Amazing Grace",
					content: "Verse 1 line 1\n\nVerse 2 line 1",
				},
			],
			liveItemId: "item-1",
			liveCueIndex: 0,
		});

		render(<LivePreviewScreenPanel />);

		const blackoutBtn = screen.getByRole("button", { name: /blackout/i });
		expect(blackoutBtn).toHaveAttribute("aria-pressed", "false");
		expect(blackoutBtn).not.toHaveClass("bg-red-600");
		expect(screen.getByText("Verse 1 line 1")).toBeInTheDocument();
		expect(screen.queryByText("Output is blacked out")).not.toBeInTheDocument();

		await user.click(blackoutBtn);

		expect(usePlaylistStore.getState().isLiveBlackout).toBe(true);
		expect(blackoutBtn).toHaveAttribute("aria-pressed", "true");
		expect(blackoutBtn).toHaveClass("bg-red-600");
		expect(screen.queryByText("Verse 1 line 1")).not.toBeInTheDocument();
		expect(screen.getByText("Output is blacked out")).toBeInTheDocument();

		await user.click(blackoutBtn);

		expect(usePlaylistStore.getState().isLiveBlackout).toBe(false);
		expect(blackoutBtn).toHaveAttribute("aria-pressed", "false");
		expect(blackoutBtn).not.toHaveClass("bg-red-600");
		expect(screen.getByText("Verse 1 line 1")).toBeInTheDocument();
		expect(screen.queryByText("Output is blacked out")).not.toBeInTheDocument();
	});

	it("gives Blackout badge precedence over Clear badge on canvas when both are active", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({
			items: [
				{
					id: "item-1",
					title: "Amazing Grace",
					content: "Verse 1 line 1",
				},
			],
			liveItemId: "item-1",
			liveCueIndex: 0,
		});

		render(<LivePreviewScreenPanel />);

		const clearBtn = screen.getByRole("button", { name: /clear/i });
		const blackoutBtn = screen.getByRole("button", { name: /blackout/i });

		await user.click(clearBtn);
		expect(screen.getByText("Output text is cleared")).toBeInTheDocument();

		await user.click(blackoutBtn);
		expect(screen.getByText("Output is blacked out")).toBeInTheDocument();
		expect(
			screen.queryByText("Output text is cleared"),
		).not.toBeInTheDocument();

		await user.click(blackoutBtn);
		expect(screen.getByText("Output text is cleared")).toBeInTheDocument();
		expect(screen.queryByText("Output is blacked out")).not.toBeInTheDocument();
	});

	it("does not introduce interactive tab stops on panel or canvas container", () => {
		render(<LivePreviewScreenPanel />);

		const panel = screen.getByRole("region", {
			name: "Live preview screen panel",
		});
		expect(panel).not.toHaveAttribute("tabindex");

		const canvas = screen.getByRole("region", { name: "Live preview canvas" });
		expect(canvas).not.toHaveAttribute("tabindex");

		const buttons = screen.getAllByRole("button");
		expect(buttons).toHaveLength(2);
		expect(screen.queryByRole("link")).not.toBeInTheDocument();
		expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
	});
});
