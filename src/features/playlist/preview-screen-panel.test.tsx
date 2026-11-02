import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { act, cleanup, render, screen } from "@testing-library/react";
import { useEditorDraftStore } from "./editor-draft-store";
import { PreviewScreenPanel } from "./preview-screen-panel";
import { usePlaylistStore } from "./store";

describe("PreviewScreenPanel", () => {
	beforeEach(() => {
		useEditorDraftStore.getState().clearDraft();
		usePlaylistStore.setState(usePlaylistStore.getInitialState(), true);
	});

	afterEach(() => {
		cleanup();
		useEditorDraftStore.getState().clearDraft();
	});

	it("renders 'Preview' header with monitor icon and without counter badge or navigation buttons", () => {
		render(<PreviewScreenPanel />);

		expect(
			screen.getByRole("heading", { name: "Preview" }),
		).toBeInTheDocument();
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
		expect(screen.queryByText(/badge|count/i)).not.toBeInTheDocument();
	});

	it("displays selected cue text when an item is selected", () => {
		usePlaylistStore.setState({
			items: [
				{
					id: "item-1",
					title: "Amazing Grace",
					content: "Verse 1 line 1\nVerse 1 line 2\n\nVerse 2 line 1",
				},
			],
			selectedItemId: "item-1",
			selectedCueIndex: 1,
		});

		render(<PreviewScreenPanel />);

		expect(screen.getByText("Verse 2 line 1")).toBeInTheDocument();
	});

	it("updates displayed text when selectedCueIndex changes", () => {
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

		render(<PreviewScreenPanel />);
		expect(
			screen.getByText((content) => content.includes("Verse 1 line 1")),
		).toBeInTheDocument();

		act(() => {
			usePlaylistStore.setState({ selectedCueIndex: 1 });
		});
		expect(screen.getByText("Verse 2 line 1")).toBeInTheDocument();
	});

	it("updates preview when editor draft is active during item editing, tracking caret position", () => {
		usePlaylistStore.setState({
			items: [
				{
					id: "item-1",
					title: "Amazing Grace",
					content: "Original Verse 1",
				},
			],
			selectedItemId: "item-1",
			selectedCueIndex: 0,
			editingItemId: "item-1",
		});
		useEditorDraftStore.getState().setDraft("Draft Line 1\n\nDraft Line 2", 15);

		render(<PreviewScreenPanel />);

		expect(screen.getByText("Draft Line 2")).toBeInTheDocument();
		expect(screen.queryByText("Original Verse 1")).not.toBeInTheDocument();
	});

	it("renders blank screen indicator when no item is selected", () => {
		usePlaylistStore.setState({
			items: [],
			selectedItemId: null,
			selectedCueIndex: null,
		});

		render(<PreviewScreenPanel />);

		const canvas = screen.getByRole("region", { name: "Preview canvas" });
		expect(canvas).toBeInTheDocument();
		expect(screen.getByText("Blank screen")).toBeInTheDocument();
		expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
	});

	it("renders blank screen indicator when selected item content is empty", () => {
		usePlaylistStore.setState({
			items: [
				{
					id: "empty-item",
					title: "Empty Item",
					content: "   ",
				},
			],
			selectedItemId: "empty-item",
			selectedCueIndex: null,
		});

		render(<PreviewScreenPanel />);

		const canvas = screen.getByRole("region", { name: "Preview canvas" });
		expect(canvas).toBeInTheDocument();
		expect(screen.getByText("Blank screen")).toBeInTheDocument();
		expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
	});

	it("renders blank screen indicator when editor draft has empty content", () => {
		usePlaylistStore.setState({
			items: [
				{
					id: "item-1",
					title: "Item 1",
					content: "Verse 1",
				},
			],
			selectedItemId: "item-1",
			selectedCueIndex: 0,
			editingItemId: "item-1",
		});
		useEditorDraftStore.getState().setDraft("   \n\n   ", 0);

		render(<PreviewScreenPanel />);

		const canvas = screen.getByRole("region", { name: "Preview canvas" });
		expect(canvas).toBeInTheDocument();
		expect(screen.getByText("Blank screen")).toBeInTheDocument();
		expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
	});

	it("does not introduce interactive tab stops", () => {
		render(<PreviewScreenPanel />);

		const panel = screen.getByRole("region", { name: "Preview screen panel" });
		expect(panel).not.toHaveAttribute("tabindex");

		const canvas = screen.getByRole("region", { name: "Preview canvas" });
		expect(canvas).not.toHaveAttribute("tabindex");

		expect(screen.queryByRole("button")).not.toBeInTheDocument();
		expect(screen.queryByRole("link")).not.toBeInTheDocument();
		expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
	});

	it("renders display text in canvas when item has content", () => {
		usePlaylistStore.setState({
			items: [
				{
					id: "item-1",
					title: "Item 1",
					content: "Verse 1",
				},
			],
			selectedItemId: "item-1",
			selectedCueIndex: 0,
		});

		render(<PreviewScreenPanel />);

		const canvas = screen.getByRole("region", { name: "Preview canvas" });
		expect(canvas).toHaveTextContent("Verse 1");
	});
});
