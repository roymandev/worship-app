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
	INITIAL_PLAYLIST_STATE,
	usePlaylistStore,
} from "@/features/playlist/store";
import { WorkspaceCenterPanel } from "@/features/workspace/center-panel";
import {
	INITIAL_WORKSPACE_STATE,
	useWorkspaceStore,
} from "@/features/workspace/store";
import { Route } from "@/routes/index";

// tanstack router file route exports Route which has component
const WorkspaceView = Route.options.component ?? (() => null);

describe("Workspace Center Panel Integration", () => {
	beforeEach(() => {
		usePlaylistStore.setState({
			...INITIAL_PLAYLIST_STATE,
			items: [...INITIAL_PLAYLIST_ITEMS],
			hydrationStatus: "ready",
		});
		useWorkspaceStore.setState(INITIAL_WORKSPACE_STATE);
	});

	afterEach(() => {
		cleanup();
		usePlaylistStore.setState({
			...INITIAL_PLAYLIST_STATE,
			items: [...INITIAL_PLAYLIST_ITEMS],
			hydrationStatus: "ready",
		});
		useWorkspaceStore.setState(INITIAL_WORKSPACE_STATE);
	});

	it("renders CueListPanel and PreviewScreenPanel when editingItemId is null and selectedItemId is resolved", () => {
		render(<WorkspaceCenterPanel />);

		expect(
			screen.getByRole("region", { name: "Cue list panel" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("heading", { name: "Amazing Grace" }),
		).toBeInTheDocument();
		expect(
			screen.queryByRole("form", { name: "Edit playlist item" }),
		).not.toBeInTheDocument();
		expect(
			screen.getByRole("region", { name: "Preview screen panel" }),
		).toBeInTheDocument();
	});

	it("renders CueListPanel and PreviewScreenPanel when editingItemId cannot be resolved in playlistItems", () => {
		usePlaylistStore.setState({ editingItemId: "non-existent-id" });
		render(<WorkspaceCenterPanel />);

		expect(
			screen.getByRole("region", { name: "Cue list panel" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("heading", { name: "Amazing Grace" }),
		).toBeInTheDocument();
		expect(
			screen.queryByRole("form", { name: "Edit playlist item" }),
		).not.toBeInTheDocument();
		expect(
			screen.getByRole("region", { name: "Preview screen panel" }),
		).toBeInTheDocument();
	});

	it("renders EmptyState and PreviewScreenPanel when selectedItemId is null", () => {
		usePlaylistStore.setState({ selectedItemId: null });
		render(<WorkspaceCenterPanel />);

		expect(screen.getByText("No playlist item selected")).toBeInTheDocument();
		expect(
			screen.getByText("Select an item from the playlist to view its cues."),
		).toBeInTheDocument();
		expect(
			screen.queryByRole("region", { name: "Cue list panel" }),
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("form", { name: "Edit playlist item" }),
		).not.toBeInTheDocument();
		expect(
			screen.getByRole("region", { name: "Preview screen panel" }),
		).toBeInTheDocument();
	});

	it("renders EmptyState and PreviewScreenPanel when selectedItemId cannot be resolved in playlistItems", () => {
		usePlaylistStore.setState({ selectedItemId: "non-existent-id" });
		render(<WorkspaceCenterPanel />);

		expect(screen.getByText("No playlist item selected")).toBeInTheDocument();
		expect(
			screen.getByText("Select an item from the playlist to view its cues."),
		).toBeInTheDocument();
		expect(
			screen.getByRole("region", { name: "Preview screen panel" }),
		).toBeInTheDocument();
	});

	it("renders PlaylistItemEditor and PreviewScreenPanel when editingItemId is set and resolved", () => {
		usePlaylistStore.setState({ editingItemId: "item-1" });
		render(<WorkspaceCenterPanel />);

		expect(
			screen.queryByRole("region", { name: "Cue list panel" }),
		).not.toBeInTheDocument();
		expect(
			screen.getByRole("form", { name: "Edit playlist item" }),
		).toBeInTheDocument();
		expect(screen.getByLabelText("Title")).toHaveValue("Amazing Grace");
		expect(
			screen.getByRole("region", { name: "Preview screen panel" }),
		).toBeInTheDocument();
	});

	it("automatically opens editor in center panel when adding an item", async () => {
		const user = userEvent.setup();
		render(<WorkspaceView />);

		expect(
			screen.getByRole("region", { name: "Cue list panel" }),
		).toBeInTheDocument();

		const addBtn = screen.getByRole("button", { name: "Add item" });
		await user.click(addBtn);

		expect(
			screen.queryByRole("region", { name: "Cue list panel" }),
		).not.toBeInTheDocument();
		expect(
			screen.getByRole("form", { name: "Edit playlist item" }),
		).toBeInTheDocument();
		expect(screen.getByLabelText("Title")).toHaveValue("(Untitled)");
	});

	it("clicking edit in context menu in PlaylistPanel opens editor in center panel", async () => {
		const user = userEvent.setup();
		render(<WorkspaceView />);

		expect(
			screen.getByRole("region", { name: "Cue list panel" }),
		).toBeInTheDocument();

		const rows = screen.getAllByRole("row");
		await user.pointer({ keys: "[MouseRight]", target: rows[1] }); // item-2: Psalm 23

		const menu = await screen.findByRole("menu");
		const editBtn = within(menu).getByRole("menuitem", { name: /edit item/i });
		await user.click(editBtn);

		expect(
			screen.queryByRole("region", { name: "Cue list panel" }),
		).not.toBeInTheDocument();
		expect(
			screen.getByRole("form", { name: "Edit playlist item" }),
		).toBeInTheDocument();
		expect(screen.getByLabelText("Title")).toHaveValue("Psalm 23");
	});

	it("pressing 'F2' on a focused row in PlaylistPanel opens editor in center panel", async () => {
		const user = userEvent.setup();
		render(<WorkspaceView />);

		expect(
			screen.getByRole("region", { name: "Cue list panel" }),
		).toBeInTheDocument();

		const rows = screen.getAllByRole("row");
		rows[0].focus();
		await user.keyboard("{F2}");

		expect(
			screen.queryByRole("region", { name: "Cue list panel" }),
		).not.toBeInTheDocument();
		expect(
			screen.getByRole("form", { name: "Edit playlist item" }),
		).toBeInTheDocument();
		expect(screen.getByLabelText("Title")).toHaveValue("Amazing Grace");
	});

	it("deleting the active item being edited resets editingItemId and returns center panel to CueListPanel", async () => {
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

		// Center panel should return to CueListPanel
		await waitFor(() => {
			expect(
				screen.getByRole("region", { name: "Cue list panel" }),
			).toBeInTheDocument();
		});
		expect(
			screen.queryByRole("form", { name: "Edit playlist item" }),
		).not.toBeInTheDocument();
		expect(usePlaylistStore.getState().editingItemId).toBeNull();
	});

	it("prompts discard dialog when switching items in workspace with a dirty draft, aborting switch on cancel and transitioning on discard", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({ editingItemId: "item-1" });
		render(<WorkspaceView />);

		// Verify item-1 editor is open
		const titleInput = screen.getByLabelText("Title");
		expect(titleInput).toHaveValue("Amazing Grace");

		// Modify title to make draft dirty
		await user.type(titleInput, " modified lyrics");

		// Try to switch by triggering edit on Psalm 23 (rows[1]) via context menu
		const rows = screen.getAllByRole("row");
		await user.pointer({ keys: "[MouseRight]", target: rows[1] });
		const menu = await screen.findByRole("menu");
		const editBtn = within(menu).getByRole("menuitem", { name: /edit item/i });
		await user.click(editBtn);

		// Discard confirmation dialog should appear
		const dialog = await screen.findByRole("alertdialog");
		expect(dialog).toBeInTheDocument();
		expect(screen.getByText("Discard unsaved changes?")).toBeInTheDocument();

		// Click Cancel in discard dialog
		const cancelDialogBtn = screen.getByRole("button", { name: "Cancel" });
		await user.click(cancelDialogBtn);

		// Dialog closes and editor stays on item-1 with modified draft intact
		await waitFor(() => {
			expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
		});
		expect(
			screen.getByRole("form", { name: "Edit playlist item" }),
		).toBeInTheDocument();
		expect(screen.getByLabelText("Title")).toHaveValue(
			"Amazing Grace modified lyrics",
		);
		expect(usePlaylistStore.getState().editingItemId).toBe("item-1");

		// Try switching again to Psalm 23 (rows[1]) via context menu
		await user.pointer({ keys: "[MouseRight]", target: rows[1] });
		const menu2 = await screen.findByRole("menu");
		const editBtn2 = within(menu2).getByRole("menuitem", {
			name: /edit item/i,
		});
		await user.click(editBtn2);

		// Discard dialog appears again
		const dialog2 = await screen.findByRole("alertdialog");
		expect(dialog2).toBeInTheDocument();

		// Click Discard
		const discardBtn = screen.getByRole("button", { name: "Discard" });
		await user.click(discardBtn);

		// Transition completes to Psalm 23
		await waitFor(() => {
			expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
			expect(screen.getByLabelText("Title")).toHaveValue("Psalm 23");
			expect(usePlaylistStore.getState().editingItemId).toBe("item-2");
		});
	});
});
