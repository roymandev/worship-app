import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CueListPanel } from "./cue-list-panel";
import { usePlaylistStore } from "./store";

describe("CueListPanel", () => {
	beforeEach(() => {
		usePlaylistStore.setState(usePlaylistStore.getInitialState(), true);
	});

	afterEach(() => {
		cleanup();
	});

	it("renders header with selected item title and no cue count badge", () => {
		usePlaylistStore.setState({
			items: [
				{
					id: "item-1",
					title: "Amazing Grace",
					content: "Verse 1 line 1\nVerse 1 line 2\n\nVerse 2 line 1",
				},
			],
			selectedItemId: "item-1",
			selectedCueIndex: 0,
		});

		render(<CueListPanel />);

		expect(
			screen.getByRole("heading", { name: "Amazing Grace" }),
		).toBeInTheDocument();
		expect(screen.queryByText(/badge|cues|count/i)).not.toBeInTheDocument();
	});

	it("renders 'No item selected' in header when no item is selected", () => {
		usePlaylistStore.setState({
			items: [],
			selectedItemId: null,
			selectedCueIndex: null,
		});

		render(<CueListPanel />);

		expect(
			screen.getByRole("heading", { name: "No item selected" }),
		).toBeInTheDocument();
		expect(screen.getByText("No cues")).toBeInTheDocument();
		expect(
			screen.getByText("This playlist item has no content yet."),
		).toBeInTheDocument();
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
			selectedItemId: "item-1",
			selectedCueIndex: 0,
		});

		render(<CueListPanel />);

		const grid = screen.getByRole("grid", { name: "Cue items" });
		expect(grid).toBeInTheDocument();

		const rows = screen.getAllByRole("row");
		expect(rows).toHaveLength(2);

		expect(rows[0]).toHaveAttribute("aria-selected", "true");
		expect(rows[0]).toHaveAttribute("tabindex", "0");
		expect(rows[0]).toHaveAttribute("data-cue-index", "0");
		expect(rows[0].textContent).toBe("Verse 1 line 1\nVerse 1 line 2");

		expect(rows[1]).toHaveAttribute("aria-selected", "false");
		expect(rows[1]).toHaveAttribute("tabindex", "-1");
		expect(rows[1]).toHaveAttribute("data-cue-index", "1");
		expect(rows[1].textContent).toBe("Verse 2 line 1");
	});

	it("clicking a cue row selects that cue", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({
			items: [
				{
					id: "item-1",
					title: "Song",
					content: "Cue 1\n\nCue 2\n\nCue 3",
				},
			],
			selectedItemId: "item-1",
			selectedCueIndex: 0,
		});

		render(<CueListPanel />);

		const rows = screen.getAllByRole("row");
		expect(rows[0]).toHaveAttribute("aria-selected", "true");

		await user.click(rows[1]);

		expect(usePlaylistStore.getState().selectedCueIndex).toBe(1);
		expect(rows[1]).toHaveAttribute("aria-selected", "true");
		expect(rows[0]).toHaveAttribute("aria-selected", "false");
	});

	it("navigates cues using ArrowDown and ArrowUp keyboard navigation", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({
			items: [
				{
					id: "item-1",
					title: "Song",
					content: "Cue 1\n\nCue 2\n\nCue 3",
				},
			],
			selectedItemId: "item-1",
			selectedCueIndex: 0,
		});

		render(<CueListPanel />);

		const rows = screen.getAllByRole("row");
		rows[0].focus();
		expect(rows[0]).toHaveFocus();

		await user.keyboard("{ArrowDown}");
		expect(usePlaylistStore.getState().selectedCueIndex).toBe(1);
		expect(rows[1]).toHaveFocus();

		await user.keyboard("{ArrowDown}");
		expect(usePlaylistStore.getState().selectedCueIndex).toBe(2);
		expect(rows[2]).toHaveFocus();

		await user.keyboard("{ArrowUp}");
		expect(usePlaylistStore.getState().selectedCueIndex).toBe(1);
		expect(rows[1]).toHaveFocus();
	});

	it("assigns tabIndex 0 to index 0 when selectedCueIndex is null", () => {
		usePlaylistStore.setState({
			items: [
				{
					id: "item-1",
					title: "Song",
					content: "Cue 1\n\nCue 2",
				},
			],
			selectedItemId: "item-1",
			selectedCueIndex: null,
		});

		render(<CueListPanel />);

		const rows = screen.getAllByRole("row");
		expect(rows[0]).toHaveAttribute("tabindex", "0");
		expect(rows[1]).toHaveAttribute("tabindex", "-1");
	});

	it("renders empty state when content is empty", () => {
		usePlaylistStore.setState({
			items: [
				{
					id: "item-1",
					title: "Empty Item",
					content: "   \n\n   ",
				},
			],
			selectedItemId: "item-1",
			selectedCueIndex: null,
		});

		render(<CueListPanel />);

		expect(screen.getByText("No cues")).toBeInTheDocument();
		expect(
			screen.getByText("This playlist item has no content yet."),
		).toBeInTheDocument();
		expect(screen.queryByRole("grid")).not.toBeInTheDocument();
	});
});
