import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LiveCueListPanel } from "./live-cue-list-panel";
import { usePlaylistStore } from "./store";

describe("LiveCueListPanel", () => {
	beforeEach(() => {
		usePlaylistStore.setState(usePlaylistStore.getInitialState(), true);
	});

	afterEach(() => {
		cleanup();
	});

	it("renders header with live item title when live item is active", () => {
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

		render(<LiveCueListPanel />);

		expect(
			screen.getByRole("heading", { name: "Amazing Grace" }),
		).toBeInTheDocument();
	});

	it("renders 'No active live item' and empty state when liveItemId is null", () => {
		usePlaylistStore.setState({
			items: [],
			liveItemId: null,
			liveCueIndex: null,
		});

		render(<LiveCueListPanel />);

		expect(
			screen.getByRole("heading", { name: "No active live item" }),
		).toBeInTheDocument();
		expect(screen.getByText("No live item")).toBeInTheDocument();
		expect(
			screen.getByText("Double-click an item or cue to go live."),
		).toBeInTheDocument();
	});

	it("renders empty state when live item has no cues", () => {
		usePlaylistStore.setState({
			items: [
				{
					id: "item-1",
					title: "Empty Item",
					content: "   \n\n   ",
				},
			],
			liveItemId: "item-1",
			liveCueIndex: null,
		});

		render(<LiveCueListPanel />);

		expect(screen.getByText("No cues")).toBeInTheDocument();
		expect(
			screen.getByText("This active live item has no cues."),
		).toBeInTheDocument();
		expect(screen.queryByRole("grid")).not.toBeInTheDocument();
	});

	it("renders all cue rows with line breaks preserved and proper accessibility attributes", () => {
		usePlaylistStore.setState({
			items: [
				{
					id: "item-1",
					title: "Song With Cues",
					content: "Verse 1 line 1\nVerse 1 line 2\n\nVerse 2 line 1",
				},
			],
			liveItemId: "item-1",
			liveCueIndex: 0,
		});

		render(<LiveCueListPanel />);

		const grid = screen.getByRole("grid", { name: "Live cue items" });
		expect(grid).toBeInTheDocument();

		const rows = screen.getAllByRole("row");
		expect(rows).toHaveLength(2);

		expect(rows[0]).toHaveAttribute("aria-selected", "true");
		expect(rows[0]).toHaveAttribute("tabindex", "0");
		expect(rows[0]).toHaveAttribute("data-live-cue-index", "0");
		expect(rows[0].textContent).toBe("Verse 1 line 1\nVerse 1 line 2");

		expect(rows[1]).toHaveAttribute("aria-selected", "false");
		expect(rows[1]).toHaveAttribute("tabindex", "-1");
		expect(rows[1]).toHaveAttribute("data-live-cue-index", "1");
		expect(rows[1].textContent).toBe("Verse 2 line 1");
	});

	it("clicking a cue row selects that live cue", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({
			items: [
				{
					id: "item-1",
					title: "Song",
					content: "Cue 1\n\nCue 2\n\nCue 3",
				},
			],
			liveItemId: "item-1",
			liveCueIndex: 0,
		});

		render(<LiveCueListPanel />);

		const rows = screen.getAllByRole("row");
		expect(rows[0]).toHaveAttribute("aria-selected", "true");

		await user.click(rows[1]);

		expect(usePlaylistStore.getState().liveCueIndex).toBe(1);
		expect(rows[1]).toHaveAttribute("aria-selected", "true");
		expect(rows[0]).toHaveAttribute("aria-selected", "false");
	});

	it("navigates cues using ArrowDown and ArrowUp keyboard navigation with boundary clamping", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({
			items: [
				{
					id: "item-1",
					title: "Song",
					content: "Cue 1\n\nCue 2\n\nCue 3",
				},
			],
			liveItemId: "item-1",
			liveCueIndex: 0,
		});

		render(<LiveCueListPanel />);

		const rows = screen.getAllByRole("row");
		act(() => {
			rows[0].focus();
		});
		expect(rows[0]).toHaveFocus();

		// Clamping at top boundary: ArrowUp on cue 0 stays on cue 0
		await user.keyboard("{ArrowUp}");
		expect(usePlaylistStore.getState().liveCueIndex).toBe(0);

		await user.keyboard("{ArrowDown}");
		expect(usePlaylistStore.getState().liveCueIndex).toBe(1);
		expect(rows[1]).toHaveFocus();

		await user.keyboard("{ArrowDown}");
		expect(usePlaylistStore.getState().liveCueIndex).toBe(2);
		expect(rows[2]).toHaveFocus();

		// Clamping at bottom boundary: ArrowDown on cue 2 stays on cue 2
		await user.keyboard("{ArrowDown}");
		expect(usePlaylistStore.getState().liveCueIndex).toBe(2);
		expect(rows[2]).toHaveFocus();

		await user.keyboard("{ArrowUp}");
		expect(usePlaylistStore.getState().liveCueIndex).toBe(1);
		expect(rows[1]).toHaveFocus();
	});

	it("assigns tabIndex 0 to index 0 when liveCueIndex is null", () => {
		usePlaylistStore.setState({
			items: [
				{
					id: "item-1",
					title: "Song",
					content: "Cue 1\n\nCue 2",
				},
			],
			liveItemId: "item-1",
			liveCueIndex: null,
		});

		render(<LiveCueListPanel />);

		const rows = screen.getAllByRole("row");
		expect(rows[0]).toHaveAttribute("tabindex", "0");
		expect(rows[1]).toHaveAttribute("tabindex", "-1");
	});
});
