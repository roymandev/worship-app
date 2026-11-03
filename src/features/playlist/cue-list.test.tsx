import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CueList } from "./cue-list";
import { usePlaylistStore } from "./store";

describe("CueList", () => {
	beforeEach(() => {
		usePlaylistStore.setState(usePlaylistStore.getInitialState(), true);
	});

	afterEach(() => {
		cleanup();
	});

	describe("stage target", () => {
		it("renders empty state when no cues exist", () => {
			usePlaylistStore.setState({
				items: [
					{
						id: "item-1",
						title: "Empty Item",
						content: "   ",
					},
				],
				selectedItemId: "item-1",
				selectedCueIndex: null,
			});

			render(
				<CueList
					target="stage"
					ariaLabel="Cue items"
					emptyMessage="No cues available for this item."
				/>,
			);

			expect(screen.getByText("No cues")).toBeInTheDocument();
			expect(
				screen.getByText("No cues available for this item."),
			).toBeInTheDocument();
			expect(screen.queryByRole("grid")).not.toBeInTheDocument();
		});

		it("renders cue rows with APG composite grid roving tabindex and attributes", () => {
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

			render(
				<CueList
					target="stage"
					ariaLabel="Cue items"
					emptyMessage="No cues available."
				/>,
			);

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

		it("clicking a row selects that cue", async () => {
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

			render(
				<CueList
					target="stage"
					ariaLabel="Cue items"
					emptyMessage="No cues available."
				/>,
			);

			const rows = screen.getAllByRole("row");
			await user.click(rows[1]);

			expect(usePlaylistStore.getState().selectedCueIndex).toBe(1);
			expect(rows[1]).toHaveAttribute("aria-selected", "true");
			expect(rows[0]).toHaveAttribute("aria-selected", "false");
		});

		it("supports keyboard navigation with ArrowDown, ArrowUp, Home, and End", async () => {
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

			render(
				<CueList
					target="stage"
					ariaLabel="Cue items"
					emptyMessage="No cues available."
				/>,
			);

			const rows = screen.getAllByRole("row");
			act(() => {
				rows[0].focus();
			});

			await user.keyboard("{ArrowDown}");
			expect(usePlaylistStore.getState().selectedCueIndex).toBe(1);
			expect(rows[1]).toHaveFocus();

			await user.keyboard("{End}");
			expect(usePlaylistStore.getState().selectedCueIndex).toBe(2);
			expect(rows[2]).toHaveFocus();

			await user.keyboard("{Home}");
			expect(usePlaylistStore.getState().selectedCueIndex).toBe(0);
			expect(rows[0]).toHaveFocus();

			await user.keyboard("{ArrowUp}");
			expect(usePlaylistStore.getState().selectedCueIndex).toBe(0);
		});

		it("double-clicking or pressing Enter triggers Go Live on stage", async () => {
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

			render(
				<CueList
					target="stage"
					ariaLabel="Cue items"
					emptyMessage="No cues available."
				/>,
			);

			const rows = screen.getAllByRole("row");
			await user.dblClick(rows[1]);

			expect(usePlaylistStore.getState().liveItemId).toBe("item-1");
			expect(usePlaylistStore.getState().liveCueIndex).toBe(1);

			act(() => {
				rows[2].focus();
			});
			await user.keyboard("{ArrowDown}");
			await user.keyboard("{Enter}");

			expect(usePlaylistStore.getState().liveCueIndex).toBe(2);
		});
	});

	describe("live target", () => {
		it("renders live cue rows and navigates with Home and End", async () => {
			const user = userEvent.setup();
			usePlaylistStore.setState({
				items: [
					{
						id: "item-1",
						title: "Live Song",
						content: "Line 1\n\nLine 2\n\nLine 3",
					},
				],
				liveItemId: "item-1",
				liveCueIndex: 0,
			});

			render(
				<CueList
					target="live"
					ariaLabel="Live cue items"
					emptyMessage="No live cues."
				/>,
			);

			const grid = screen.getByRole("grid", { name: "Live cue items" });
			expect(grid).toBeInTheDocument();

			const rows = screen.getAllByRole("row");
			expect(rows[0]).toHaveAttribute("data-live-cue-index", "0");
			expect(rows[0]).toHaveAttribute("aria-selected", "true");

			act(() => {
				rows[0].focus();
			});

			await user.keyboard("{End}");
			expect(usePlaylistStore.getState().liveCueIndex).toBe(2);
			expect(rows[2]).toHaveFocus();

			await user.keyboard("{Home}");
			expect(usePlaylistStore.getState().liveCueIndex).toBe(0);
			expect(rows[0]).toHaveFocus();
		});
	});
});
