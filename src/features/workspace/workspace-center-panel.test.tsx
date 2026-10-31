import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
	INITIAL_PLAYLIST_ITEMS,
	usePlaylistStore,
} from "@/features/playlist/store";
import { Route } from "@/routes/index";

// tanstack router file route exports Route which has component
const WorkspaceView = Route.options.component ?? (() => null);

describe("Workspace Center Panel Integration", () => {
	beforeEach(() => {
		usePlaylistStore.setState({
			items: [...INITIAL_PLAYLIST_ITEMS],
			selectedItemId: "item-1",
			editingItemId: null,
			mode: "view",
			activeConfirmDeleteId: null,
		});
	});

	afterEach(() => {
		cleanup();
	});

	it("renders SlidesPanel ('Center') when editingItemId is null", () => {
		render(<WorkspaceView />);

		expect(screen.getByText("Center")).toBeInTheDocument();
		expect(
			screen.queryByRole("form", { name: "Edit playlist item" }),
		).not.toBeInTheDocument();
	});

	it("renders SlidesPanel ('Center') when editingItemId cannot be resolved in playlistItems", () => {
		usePlaylistStore.setState({ editingItemId: "non-existent-id" });
		render(<WorkspaceView />);

		expect(screen.getByText("Center")).toBeInTheDocument();
		expect(
			screen.queryByRole("form", { name: "Edit playlist item" }),
		).not.toBeInTheDocument();
	});

	it("renders PlaylistItemEditor when editingItemId is set and resolved", () => {
		usePlaylistStore.setState({ editingItemId: "item-1" });
		render(<WorkspaceView />);

		expect(screen.queryByText("Center")).not.toBeInTheDocument();
		expect(
			screen.getByRole("form", { name: "Edit playlist item" }),
		).toBeInTheDocument();
		expect(screen.getByLabelText("Title")).toHaveValue("Amazing Grace");
	});

	it("automatically opens editor in center panel when adding an item", async () => {
		const user = userEvent.setup();
		render(<WorkspaceView />);

		expect(screen.getByText("Center")).toBeInTheDocument();

		const addBtn = screen.getByRole("button", { name: "Add item" });
		await user.click(addBtn);

		expect(screen.queryByText("Center")).not.toBeInTheDocument();
		expect(
			screen.getByRole("form", { name: "Edit playlist item" }),
		).toBeInTheDocument();
		expect(screen.getByLabelText("Title")).toHaveValue("(Untitled)");
	});

	it("clicking pencil button in PlaylistPanel opens editor in center panel", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({ mode: "edit" });
		render(<WorkspaceView />);

		expect(screen.getByText("Center")).toBeInTheDocument();

		const editBtns = screen.getAllByRole("button", { name: "Edit item" });
		await user.click(editBtns[1]); // item-2: Psalm 23

		expect(screen.queryByText("Center")).not.toBeInTheDocument();
		expect(
			screen.getByRole("form", { name: "Edit playlist item" }),
		).toBeInTheDocument();
		expect(screen.getByLabelText("Title")).toHaveValue("Psalm 23");
	});

	it("pressing 'e' on a focused row in PlaylistPanel opens editor in center panel", async () => {
		const user = userEvent.setup();
		render(<WorkspaceView />);

		expect(screen.getByText("Center")).toBeInTheDocument();

		const rows = screen.getAllByRole("row");
		rows[0].focus();
		await user.keyboard("e");

		expect(screen.queryByText("Center")).not.toBeInTheDocument();
		expect(
			screen.getByRole("form", { name: "Edit playlist item" }),
		).toBeInTheDocument();
		expect(screen.getByLabelText("Title")).toHaveValue("Amazing Grace");
	});

	it("deleting the active item being edited resets editingItemId and returns center panel to SlidesPanel", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({ mode: "edit", editingItemId: "item-2" });
		render(<WorkspaceView />);

		// Initially editing item-2
		expect(
			screen.getByRole("form", { name: "Edit playlist item" }),
		).toBeInTheDocument();
		expect(screen.getByLabelText("Title")).toHaveValue("Psalm 23");

		// Click delete on Psalm 23 (index 1)
		const deleteBtns = screen.getAllByRole("button", { name: "Delete item" });
		await user.click(deleteBtns[1]);

		// Confirm delete
		const confirmDeleteBtn = screen.getByRole("button", { name: "Delete" });
		await user.click(confirmDeleteBtn);

		// Center panel should return to SlidesPanel
		await waitFor(() => {
			expect(screen.getByText("Center")).toBeInTheDocument();
		});
		expect(
			screen.queryByRole("form", { name: "Edit playlist item" }),
		).not.toBeInTheDocument();
		expect(usePlaylistStore.getState().editingItemId).toBeNull();
	});
});
