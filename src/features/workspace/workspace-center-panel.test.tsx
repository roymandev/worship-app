import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import {
	cleanup,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
	INITIAL_PLAYLIST_ITEMS,
	usePlaylistStore,
} from "@/features/playlist/store";
import { WorkspaceCenterPanel } from "@/features/workspace/center-panel";
import { Route } from "@/routes/index";

// tanstack router file route exports Route which has component
const WorkspaceView = Route.options.component ?? (() => null);

describe("Workspace Center Panel Integration", () => {
	beforeEach(() => {
		usePlaylistStore.setState({
			items: [...INITIAL_PLAYLIST_ITEMS],
			selectedItemId: "item-1",
			editingItemId: null,
			activeConfirmDeleteId: null,
		});
	});

	afterEach(() => {
		cleanup();
	});

	it("renders SlidesPanel ('Center') when editingItemId is null", () => {
		render(<WorkspaceCenterPanel />);

		expect(screen.getByText("Center")).toBeInTheDocument();
		expect(
			screen.queryByRole("form", { name: "Edit playlist item" }),
		).not.toBeInTheDocument();
	});

	it("renders SlidesPanel ('Center') when editingItemId cannot be resolved in playlistItems", () => {
		usePlaylistStore.setState({ editingItemId: "non-existent-id" });
		render(<WorkspaceCenterPanel />);

		expect(screen.getByText("Center")).toBeInTheDocument();
		expect(
			screen.queryByRole("form", { name: "Edit playlist item" }),
		).not.toBeInTheDocument();
	});

	it("renders PlaylistItemEditor when editingItemId is set and resolved", () => {
		usePlaylistStore.setState({ editingItemId: "item-1" });
		render(<WorkspaceCenterPanel />);

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

	it("clicking edit in context menu in PlaylistPanel opens editor in center panel", async () => {
		const user = userEvent.setup();
		render(<WorkspaceView />);

		expect(screen.getByText("Center")).toBeInTheDocument();

		const rows = screen.getAllByRole("row");
		await user.pointer({ keys: "[MouseRight]", target: rows[1] }); // item-2: Psalm 23

		const menu = await screen.findByRole("menu");
		const editBtn = within(menu).getByRole("menuitem", { name: /edit item/i });
		await user.click(editBtn);

		expect(screen.queryByText("Center")).not.toBeInTheDocument();
		expect(
			screen.getByRole("form", { name: "Edit playlist item" }),
		).toBeInTheDocument();
		expect(screen.getByLabelText("Title")).toHaveValue("Psalm 23");
	});

	it("pressing 'F2' on a focused row in PlaylistPanel opens editor in center panel", async () => {
		const user = userEvent.setup();
		render(<WorkspaceView />);

		expect(screen.getByText("Center")).toBeInTheDocument();

		const rows = screen.getAllByRole("row");
		rows[0].focus();
		await user.keyboard("{F2}");

		expect(screen.queryByText("Center")).not.toBeInTheDocument();
		expect(
			screen.getByRole("form", { name: "Edit playlist item" }),
		).toBeInTheDocument();
		expect(screen.getByLabelText("Title")).toHaveValue("Amazing Grace");
	});

	it("deleting the active item being edited resets editingItemId and returns center panel to SlidesPanel", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({ editingItemId: "item-2" });
		render(<WorkspaceView />);

		// Initially editing item-2
		expect(
			screen.getByRole("form", { name: "Edit playlist item" }),
		).toBeInTheDocument();
		expect(screen.getByLabelText("Title")).toHaveValue("Psalm 23");

		// Press Delete on Psalm 23 (index 1)
		const rows = screen.getAllByRole("row");
		rows[1].focus();
		await user.keyboard("{Delete}");

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
