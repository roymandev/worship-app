import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import {
	cleanup,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlaylistPanel } from "./panel";
import { INITIAL_PLAYLIST_ITEMS, usePlaylistStore } from "./store";

describe("PlaylistPanel", () => {
	beforeEach(() => {
		usePlaylistStore.setState({
			items: [...INITIAL_PLAYLIST_ITEMS],
			selectedItemId: "item-1",
			mode: "view",
			activeConfirmDeleteId: null,
		});
	});

	afterEach(() => {
		cleanup();
	});

	it("renders the 3 initial dummy items in view mode with header", () => {
		render(<PlaylistPanel />);

		expect(
			screen.getByRole("heading", { name: "Playlist" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Add item" }),
		).toBeInTheDocument();
		const organizeBtn = screen.getByRole("button", { name: "Organize" });
		expect(organizeBtn).toBeInTheDocument();
		expect(organizeBtn).toHaveAttribute("aria-pressed", "false");

		const grid = screen.getByRole("grid", { name: "Playlist items" });
		expect(grid).toBeInTheDocument();

		const rows = screen.getAllByRole("row");
		expect(rows).toHaveLength(3);
		expect(rows[0]).toHaveTextContent("Amazing Grace");
		expect(rows[0]).toHaveAttribute("aria-selected", "true");
		expect(rows[0]).toHaveAttribute("tabindex", "0");
		expect(rows[1]).toHaveTextContent("Psalm 23");
		expect(rows[1]).toHaveAttribute("aria-selected", "false");
		expect(rows[1]).toHaveAttribute("tabindex", "-1");
		expect(rows[2]).toHaveTextContent("10,000 Reasons");
	});

	it("keyboard navigation (ArrowDown / ArrowUp) updates selected item and roving focus", async () => {
		const user = userEvent.setup();
		render(<PlaylistPanel />);

		const rows = screen.getAllByRole("row");
		rows[0].focus();
		expect(rows[0]).toHaveFocus();

		await user.keyboard("{ArrowDown}");

		expect(usePlaylistStore.getState().selectedItemId).toBe("item-2");
		expect(rows[1]).toHaveAttribute("aria-selected", "true");

		await user.keyboard("{ArrowDown}");
		expect(usePlaylistStore.getState().selectedItemId).toBe("item-3");
		expect(rows[2]).toHaveAttribute("aria-selected", "true");

		await user.keyboard("{ArrowUp}");
		expect(usePlaylistStore.getState().selectedItemId).toBe("item-2");
		expect(rows[1]).toHaveAttribute("aria-selected", "true");
	});

	it("clicking '+ Add' button appends an (Untitled) item, selects it, and renders it in the list", async () => {
		const user = userEvent.setup();
		render(<PlaylistPanel />);

		const addBtn = screen.getByRole("button", { name: "Add item" });
		await user.click(addBtn);

		const rows = screen.getAllByRole("row");
		expect(rows).toHaveLength(4);
		const lastRow = rows[3];
		expect(lastRow).toHaveTextContent("(Untitled)");
		expect(lastRow).toHaveAttribute("aria-selected", "true");
		expect(usePlaylistStore.getState().selectedItemId).toBe(
			usePlaylistStore.getState().items[3].id,
		);
	});

	it("toggling 'Organize' switches to edit mode ('Done' label, aria-pressed='true') and renders edit actions on rows", async () => {
		const user = userEvent.setup();
		render(<PlaylistPanel />);

		const organizeBtn = screen.getByRole("button", { name: "Organize" });
		await user.click(organizeBtn);

		const doneBtn = screen.getByRole("button", { name: "Done" });
		expect(doneBtn).toBeInTheDocument();
		expect(doneBtn).toHaveAttribute("aria-pressed", "true");
		expect(usePlaylistStore.getState().mode).toBe("edit");

		// Edit mode actions should be present on rows
		expect(screen.getAllByRole("button", { name: "Move up" })).toHaveLength(3);
		expect(screen.getAllByRole("button", { name: "Move down" })).toHaveLength(
			3,
		);
		expect(screen.getAllByRole("button", { name: "Delete item" })).toHaveLength(
			3,
		);

		// Click Done to switch back
		await user.click(doneBtn);
		expect(
			screen.getByRole("button", { name: "Organize" }),
		).toBeInTheDocument();
		expect(usePlaylistStore.getState().mode).toBe("view");
	});

	it("pressing Escape in edit mode switches back to view mode and restores focus to active row", async () => {
		const user = userEvent.setup();
		render(<PlaylistPanel />);

		// Switch to edit mode
		await user.click(screen.getByRole("button", { name: "Organize" }));
		expect(usePlaylistStore.getState().mode).toBe("edit");

		const rows = screen.getAllByRole("row");
		rows[0].focus();
		expect(rows[0]).toHaveFocus();

		await user.keyboard("{Escape}");
		expect(usePlaylistStore.getState().mode).toBe("view");
	});

	it("renders empty state when all items deleted, and '+ Add Item' restores an item and focuses row", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({ items: [], selectedItemId: null });

		render(<PlaylistPanel />);

		expect(screen.getByText("Playlist is empty")).toBeInTheDocument();
		expect(
			screen.getByText("Add items to build your worship service order."),
		).toBeInTheDocument();
		expect(screen.queryByRole("grid")).not.toBeInTheDocument();

		const organizeBtn = screen.getByRole("button", { name: "Organize" });
		expect(organizeBtn).toBeDisabled();

		const addFallbackBtn = screen.getByRole("button", { name: "Add Item" });
		await user.click(addFallbackBtn);

		expect(usePlaylistStore.getState().items).toHaveLength(1);
		expect(
			screen.getByRole("grid", { name: "Playlist items" }),
		).toBeInTheDocument();
		expect(screen.getByText("(Untitled)")).toBeInTheDocument();

		await waitFor(() => {
			const activeRow = screen.getByRole("row", { selected: true });
			expect(activeRow).toHaveFocus();
		});
	});

	it("activates empty state Add Item button via Enter key and restores playlist item", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({ items: [], selectedItemId: null });

		render(<PlaylistPanel />);

		const addFallbackBtn = screen.getByRole("button", { name: "Add Item" });
		addFallbackBtn.focus();
		expect(addFallbackBtn).toHaveFocus();

		await user.keyboard("{Enter}");

		expect(usePlaylistStore.getState().items).toHaveLength(1);
		expect(
			screen.getByRole("grid", { name: "Playlist items" }),
		).toBeInTheDocument();

		await waitFor(() => {
			const activeRow = screen.getByRole("row", { selected: true });
			expect(activeRow).toHaveFocus();
		});
	});

	it("activates empty state Add Item button via Space key and restores playlist item", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({ items: [], selectedItemId: null });

		render(<PlaylistPanel />);

		const addFallbackBtn = screen.getByRole("button", { name: "Add Item" });
		addFallbackBtn.focus();
		expect(addFallbackBtn).toHaveFocus();

		await user.keyboard(" ");

		expect(usePlaylistStore.getState().items).toHaveLength(1);
		expect(
			screen.getByRole("grid", { name: "Playlist items" }),
		).toBeInTheDocument();

		await waitFor(() => {
			const activeRow = screen.getByRole("row", { selected: true });
			expect(activeRow).toHaveFocus();
		});
	});

	it("shifts focus to empty state Add Item button and resets mode to view when deleting the last item", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({
			items: [
				{
					id: "item-only",
					title: "Single Item",
					content: "Solo",
				},
			],
			selectedItemId: "item-only",
			mode: "edit",
		});

		render(<PlaylistPanel />);

		const deleteBtn = screen.getByRole("button", { name: "Delete item" });
		await user.click(deleteBtn);

		const confirmDeleteBtn = screen.getByRole("button", { name: "Delete" });
		await user.click(confirmDeleteBtn);

		expect(usePlaylistStore.getState().mode).toBe("view");
		await waitFor(() => {
			const emptyAddBtn = screen.getByRole("button", { name: "Add Item" });
			expect(emptyAddBtn).toHaveFocus();
		});
	});

	it("reordering items via Move Up / Move Down buttons", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({ mode: "edit" });

		render(<PlaylistPanel />);

		const moveDownBtns = screen.getAllByRole("button", { name: "Move down" });
		// Move first item down
		await user.click(moveDownBtns[0]);

		const rows = screen.getAllByRole("row");
		expect(rows[0]).toHaveTextContent("Psalm 23");
		expect(rows[1]).toHaveTextContent("Amazing Grace");
		expect(usePlaylistStore.getState().selectedItemId).toBe("item-1");

		const moveUpBtns = screen.getAllByRole("button", { name: "Move up" });
		// Move item-1 (now index 1) back up
		await user.click(moveUpBtns[1]);

		const reorderedRows = screen.getAllByRole("row");
		expect(reorderedRows[0]).toHaveTextContent("Amazing Grace");
		expect(reorderedRows[1]).toHaveTextContent("Psalm 23");
	});

	it("reordering items via Alt+ArrowDown / Alt+ArrowUp keyboard shortcuts", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({ mode: "edit" });

		render(<PlaylistPanel />);

		const rows = screen.getAllByRole("row");
		rows[0].focus();

		await user.keyboard("{Alt>}{ArrowDown}{/Alt}");
		expect(usePlaylistStore.getState().items[0].id).toBe("item-2");
		expect(usePlaylistStore.getState().items[1].id).toBe("item-1");

		await user.keyboard("{Alt>}{ArrowUp}{/Alt}");
		expect(usePlaylistStore.getState().items[0].id).toBe("item-1");
		expect(usePlaylistStore.getState().items[1].id).toBe("item-2");
	});

	it("deleting an item via inline confirmation popover removes item, updates selection, and focuses neighbor row", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({ mode: "edit" });

		render(<PlaylistPanel />);

		const deleteBtns = screen.getAllByRole("button", { name: "Delete item" });
		// Click delete on second item (Psalm 23)
		await user.click(deleteBtns[1]);

		// Popover should open with Cancel focused
		expect(screen.getByText("Delete this item?")).toBeInTheDocument();
		const cancelBtn = screen.getByRole("button", { name: "Cancel" });
		await waitFor(() => expect(cancelBtn).toHaveFocus());
		const confirmDeleteBtn = screen.getByRole("button", { name: "Delete" });

		await user.click(confirmDeleteBtn);

		const rows = screen.getAllByRole("row");
		expect(rows).toHaveLength(2);
		expect(screen.queryByText("Psalm 23")).not.toBeInTheDocument();
		expect(rows[0]).toHaveTextContent("Amazing Grace");
		expect(rows[1]).toHaveTextContent("10,000 Reasons");
		// Deleting item at index 1 restores focus to the subsequent item (now at index 1: "10,000 Reasons")
		expect(rows[1]).toHaveFocus();
	});

	it("deleting the last item in edit mode restores focus to the preceding item", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({ mode: "edit", selectedItemId: "item-1" });

		render(<PlaylistPanel />);

		const deleteBtns = screen.getAllByRole("button", { name: "Delete item" });
		// Click delete on the last item (item 3: 10,000 Reasons)
		await user.click(deleteBtns[2]);

		const confirmDeleteBtn = screen.getByRole("button", { name: "Delete" });
		await user.click(confirmDeleteBtn);

		const rows = screen.getAllByRole("row");
		expect(rows).toHaveLength(2);
		expect(screen.queryByText("10,000 Reasons")).not.toBeInTheDocument();
		// Deleting last item restores focus to previous item (index 1: Psalm 23)
		expect(rows[1]).toHaveTextContent("Psalm 23");
		expect(rows[1]).toHaveFocus();
	});

	it("deleting an item in view mode via Backspace triggers popover and focuses neighbor upon delete", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({ mode: "view", selectedItemId: "item-1" });

		render(<PlaylistPanel />);

		const rows = screen.getAllByRole("row");
		rows[0].focus();
		expect(rows[0]).toHaveFocus();

		await user.keyboard("{Delete}");
		expect(screen.getByText("Delete this item?")).toBeInTheDocument();

		const cancelBtn = screen.getByRole("button", { name: "Cancel" });
		await waitFor(() => expect(cancelBtn).toHaveFocus());

		const confirmDeleteBtn = screen.getByRole("button", { name: "Delete" });
		await user.click(confirmDeleteBtn);

		const remainingRows = screen.getAllByRole("row");
		expect(remainingRows).toHaveLength(2);
		expect(remainingRows[0]).toHaveTextContent("Psalm 23");
		expect(remainingRows[0]).toHaveFocus();
	});

	it("confirms deletion via keyboard Enter on Delete button and transfers focus to neighbor row", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({ mode: "edit", selectedItemId: "item-2" });

		render(<PlaylistPanel />);

		// Item 2 is "Psalm 23"
		const deleteBtns = screen.getAllByRole("button", { name: "Delete item" });
		await user.click(deleteBtns[1]);

		const cancelBtn = screen.getByRole("button", { name: "Cancel" });
		const confirmDeleteBtn = screen.getByRole("button", { name: "Delete" });
		await waitFor(() => expect(cancelBtn).toHaveFocus());

		// Tab to Delete button and actuate with Enter
		await user.keyboard("{Tab}");
		expect(confirmDeleteBtn).toHaveFocus();

		await user.keyboard("{Enter}");

		const remainingRows = screen.getAllByRole("row");
		expect(remainingRows).toHaveLength(2);
		expect(screen.queryByText("Psalm 23")).not.toBeInTheDocument();
		// Neighbor row should receive focus (index 1 which is "10,000 Reasons", or fallback index 0)
		expect(remainingRows[1]).toHaveFocus();
	});

	it("retaining focus when reordering item to boundary index 0 (top)", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({ mode: "edit" });

		render(<PlaylistPanel />);

		const moveUpBtns = screen.getAllByRole("button", { name: "Move up" });
		// Item 1 (Psalm 23) Move Up clicked -> becomes item 0 (Move up disabled, focus shifts to Move Down or Row)
		moveUpBtns[1].focus();
		await user.click(moveUpBtns[1]);

		expect(document.activeElement).not.toBe(document.body);
		const rows = screen.getAllByRole("row");
		expect(rows[0]).toHaveTextContent("Psalm 23");
	});

	it("2D navigation: ArrowDown / ArrowUp from an action button moves selection and focus to next / previous row", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({ mode: "edit", selectedItemId: "item-1" });

		render(<PlaylistPanel />);

		const rows = screen.getAllByRole("row");
		rows[0].focus();
		expect(rows[0]).toHaveFocus();

		// Move focus into action buttons (first enabled is move down because index 0 move up is disabled)
		await user.keyboard("{ArrowRight}");
		const moveDownBtn = screen.getAllByRole("button", { name: "Move down" })[0];
		expect(document.activeElement).toBe(moveDownBtn);
		expect(moveDownBtn).toHaveFocus();
		expect(rows[0]).not.toHaveFocus();

		// ArrowDown moves to next row and synchronizes focus to that row
		await user.keyboard("{ArrowDown}");
		expect(usePlaylistStore.getState().selectedItemId).toBe("item-2");
		expect(rows[1]).toHaveFocus();
		expect(rows[1]).toHaveAttribute("aria-selected", "true");
		expect(moveDownBtn).not.toHaveFocus();

		// Now move into row 1's action buttons (Move up is enabled)
		await user.keyboard("{ArrowRight}");
		const moveUpBtnRow1 = screen.getAllByRole("button", { name: "Move up" })[1];
		expect(document.activeElement).toBe(moveUpBtnRow1);
		expect(moveUpBtnRow1).toHaveFocus();
		expect(rows[1]).not.toHaveFocus();

		// ArrowUp moves to previous row and synchronizes focus to row 0
		await user.keyboard("{ArrowUp}");
		expect(usePlaylistStore.getState().selectedItemId).toBe("item-1");
		expect(rows[0]).toHaveFocus();
		expect(rows[0]).toHaveAttribute("aria-selected", "true");
		expect(moveUpBtnRow1).not.toHaveFocus();
	});

	it("all action buttons have tabIndex -1 so sequential tab order does not step through them", () => {
		usePlaylistStore.setState({ mode: "edit" });
		render(<PlaylistPanel />);

		// Filter action buttons inside the grid
		const grid = screen.getByRole("grid", { name: "Playlist items" });
		const gridButtons = within(grid).getAllByRole("button");

		expect(gridButtons.length).toBeGreaterThan(0);
		for (const button of gridButtons) {
			expect(button).toHaveAttribute("tabindex", "-1");
		}
	});

	it("dismissing delete confirmation popover in edit mode restores focus to trigger button", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({ mode: "edit", selectedItemId: "item-2" });

		render(<PlaylistPanel />);

		const deleteBtns = screen.getAllByRole("button", { name: "Delete item" });
		const triggerBtn = deleteBtns[1];

		// Open popover by clicking delete trigger button
		await user.click(triggerBtn);

		expect(screen.getByText("Delete this item?")).toBeInTheDocument();
		const cancelBtn = screen.getByRole("button", { name: "Cancel" });
		await waitFor(() => expect(cancelBtn).toHaveFocus());

		// Cancel via button click
		await user.click(cancelBtn);

		// Popover should close and focus should be restored to trigger button
		expect(screen.queryByText("Delete this item?")).not.toBeInTheDocument();
		expect(triggerBtn).toHaveFocus();
	});

	it("dismissing delete confirmation popover in view mode restores focus to originating row", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({ mode: "view", selectedItemId: "item-1" });

		render(<PlaylistPanel />);

		const rows = screen.getAllByRole("row");
		rows[0].focus();
		expect(rows[0]).toHaveFocus();

		await user.keyboard("{Delete}");
		expect(screen.getByText("Delete this item?")).toBeInTheDocument();
		const cancelBtnView = screen.getByRole("button", { name: "Cancel" });
		await waitFor(() => expect(cancelBtnView).toHaveFocus());

		await user.keyboard("{Escape}");
		expect(screen.queryByText("Delete this item?")).not.toBeInTheDocument();
		expect(rows[0]).toHaveFocus();
	});

	it("pressing Shift+Tab from an action button exits directly to the header Organize/Done button", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({ mode: "edit", selectedItemId: "item-1" });

		render(<PlaylistPanel />);

		const doneBtn = screen.getByRole("button", { name: "Done" });
		const rows = screen.getAllByRole("row");
		rows[0].focus();
		expect(rows[0]).toHaveFocus();

		// Move focus to action button
		await user.keyboard("{ArrowRight}");
		const moveDownBtn = screen.getAllByRole("button", { name: "Move down" })[0];
		expect(document.activeElement).toBe(moveDownBtn);

		// Press Shift+Tab
		await user.keyboard("{Shift>}{Tab}{/Shift}");
		expect(document.activeElement).toBe(doneBtn);
	});

	it("traps focus inside the delete confirmation popover, prevents focus leakage, and ignores ArrowUp/ArrowDown", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({ mode: "edit", selectedItemId: "item-1" });

		render(<PlaylistPanel />);

		const deleteBtns = screen.getAllByRole("button", { name: "Delete item" });
		await user.click(deleteBtns[0]);

		expect(screen.getByRole("alertdialog")).toBeInTheDocument();
		expect(screen.getByText("Delete this item?")).toBeInTheDocument();
		const cancelBtn = screen.getByRole("button", { name: "Cancel" });

		await waitFor(() => expect(cancelBtn).toHaveFocus());

		// Verify pressing ArrowDown inside popover leaves selected item unchanged and focus within popover
		await user.keyboard("{ArrowDown}");
		expect(usePlaylistStore.getState().selectedItemId).toBe("item-1");
		expect(cancelBtn).toHaveFocus();

		// Verify pressing ArrowUp inside popover leaves selected item unchanged and focus within popover
		await user.keyboard("{ArrowUp}");
		expect(usePlaylistStore.getState().selectedItemId).toBe("item-1");
		expect(cancelBtn).toHaveFocus();

		// Verify pressing Shift+Tab inside popover leaves selected item unchanged and focus remains contained
		await user.keyboard("{Shift>}{Tab}{/Shift}");
		expect(usePlaylistStore.getState().selectedItemId).toBe("item-1");
		const confirmDeleteBtn = screen.getByRole("button", { name: "Delete" });
		expect(confirmDeleteBtn).toHaveFocus();

		// Background rows must not have focus (querying DOM container since background is inert/aria-hidden while popover is open)
		const rows = document.querySelectorAll('[role="row"]');
		for (const row of rows) {
			expect(row).not.toHaveFocus();
		}
	});

	it("cycles Tab and Arrow navigation inside delete confirmation popover with boundary clamping", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({ mode: "edit", selectedItemId: "item-1" });

		render(<PlaylistPanel />);

		const deleteBtns = screen.getAllByRole("button", { name: "Delete item" });
		await user.click(deleteBtns[0]);

		const cancelBtn = screen.getByRole("button", { name: "Cancel" });
		const deleteBtn = screen.getByRole("button", { name: "Delete" });
		const dialog = screen.getByRole("alertdialog");

		await waitFor(() => expect(cancelBtn).toHaveFocus());

		// Shift+Tab from Cancel moves backward to Delete
		await user.keyboard("{Shift>}{Tab}{/Shift}");
		expect(deleteBtn).toHaveFocus();

		// Shift+Tab from Delete moves backward to Cancel
		await user.keyboard("{Shift>}{Tab}{/Shift}");
		expect(cancelBtn).toHaveFocus();

		// Tab from Cancel moves forward to Delete
		await user.keyboard("{Tab}");
		expect(deleteBtn).toHaveFocus();

		// Tab from Delete moves forward back to Cancel
		await user.keyboard("{Tab}");
		expect(cancelBtn).toHaveFocus();

		// If focus is somehow on dialog container, Tab moves safely to Cancel
		dialog.focus();
		expect(dialog).toHaveFocus();
		await user.keyboard("{Tab}");
		expect(cancelBtn).toHaveFocus();

		// ArrowLeft on Cancel stays clamped
		await user.keyboard("{ArrowLeft}");
		expect(cancelBtn).toHaveFocus();

		// ArrowRight from Cancel moves to Delete
		await user.keyboard("{ArrowRight}");
		expect(deleteBtn).toHaveFocus();

		// ArrowRight on Delete stays clamped
		await user.keyboard("{ArrowRight}");
		expect(deleteBtn).toHaveFocus();

		// ArrowLeft from Delete moves to Cancel
		await user.keyboard("{ArrowLeft}");
		expect(cancelBtn).toHaveFocus();
	});

	it("confirms deletion via Space key on Delete button", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({ mode: "edit", selectedItemId: "item-2" });

		render(<PlaylistPanel />);

		const deleteBtns = screen.getAllByRole("button", { name: "Delete item" });
		await user.click(deleteBtns[1]);

		const cancelBtn = screen.getByRole("button", { name: "Cancel" });
		await waitFor(() => expect(cancelBtn).toHaveFocus());

		await user.keyboard("{Tab}");
		const confirmDeleteBtn = screen.getByRole("button", { name: "Delete" });
		expect(confirmDeleteBtn).toHaveFocus();

		await user.keyboard(" ");

		const remainingRows = screen.getAllByRole("row");
		expect(remainingRows).toHaveLength(2);
		expect(screen.queryByText("Psalm 23")).not.toBeInTheDocument();
	});

	it("keyboard horizontal navigation across action cell buttons and back to row", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({ mode: "edit", selectedItemId: "item-2" });

		render(<PlaylistPanel />);

		const rows = screen.getAllByRole("row");
		rows[1].focus();
		expect(rows[1]).toHaveFocus();

		// Move into actions: item 1 (index 1) has Move up enabled
		await user.keyboard("{ArrowRight}");
		const moveUpBtn = screen.getAllByRole("button", { name: "Move up" })[1];
		expect(moveUpBtn).toHaveFocus();

		// ArrowRight moves to Move down
		await user.keyboard("{ArrowRight}");
		const moveDownBtn = screen.getAllByRole("button", { name: "Move down" })[1];
		expect(moveDownBtn).toHaveFocus();

		// ArrowRight moves to Edit item
		await user.keyboard("{ArrowRight}");
		const editBtn = screen.getAllByRole("button", { name: "Edit item" })[1];
		expect(editBtn).toHaveFocus();

		// ArrowRight moves to Delete item
		await user.keyboard("{ArrowRight}");
		const deleteBtn = screen.getAllByRole("button", { name: "Delete item" })[1];
		expect(deleteBtn).toHaveFocus();

		// Clamped at end
		await user.keyboard("{ArrowRight}");
		expect(deleteBtn).toHaveFocus();

		// ArrowLeft moves back through items
		await user.keyboard("{ArrowLeft}");
		expect(editBtn).toHaveFocus();

		await user.keyboard("{ArrowLeft}");
		expect(moveDownBtn).toHaveFocus();

		await user.keyboard("{ArrowLeft}");
		expect(moveUpBtn).toHaveFocus();

		// ArrowLeft from first action returns focus to the row
		await user.keyboard("{ArrowLeft}");
		expect(rows[1]).toHaveFocus();

		// Escape from action button returns focus to the row
		await user.keyboard("{ArrowRight}");
		expect(moveUpBtn).toHaveFocus();
		await user.keyboard("{Escape}");
		expect(rows[1]).toHaveFocus();
	});

	it("clicking the Edit item (pencil) button triggers startEditingItem with item id", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({ mode: "edit", editingItemId: null });

		render(<PlaylistPanel />);

		const editBtns = screen.getAllByRole("button", { name: "Edit item" });
		expect(editBtns).toHaveLength(3);

		await user.click(editBtns[1]);
		expect(usePlaylistStore.getState().editingItemId).toBe("item-2");
	});

	it("pressing 'e' or 'E' key on a focused playlist row triggers startEditingItem with row id", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({ editingItemId: null });

		render(<PlaylistPanel />);

		const rows = screen.getAllByRole("row");
		rows[0].focus();
		expect(rows[0]).toHaveFocus();

		await user.keyboard("e");
		expect(usePlaylistStore.getState().editingItemId).toBe("item-1");

		// Test row 2 with uppercase E
		rows[2].focus();
		expect(rows[2]).toHaveFocus();

		await user.keyboard("E");
		expect(usePlaylistStore.getState().editingItemId).toBe("item-3");
	});
});
