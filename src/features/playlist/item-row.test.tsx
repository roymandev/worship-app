import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import {
	act,
	cleanup,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlaylistItemRow } from "./item-row";
import { INITIAL_PLAYLIST_ITEMS, usePlaylistStore } from "./store";

describe("PlaylistItemRow", () => {
	const sampleItem = INITIAL_PLAYLIST_ITEMS[0]; // { id: "item-1", title: "Amazing Grace", content: "..." }

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

	it("renders title and row with proper role='row', aria-selected, and tabIndex", () => {
		render(
			<PlaylistItemRow
				item={sampleItem}
				index={0}
				totalItems={3}
				isSelected={true}
				mode="view"
			/>,
		);

		const row = screen.getByRole("row");
		expect(row).toBeInTheDocument();
		expect(row).toHaveAttribute("data-item-id", "item-1");
		expect(row).toHaveAttribute("tabindex", "0");
		expect(row).toHaveAttribute("aria-selected", "true");
		expect(within(row).getByText("Amazing Grace")).toBeInTheDocument();

		const gridcells = within(row).getAllByRole("gridcell");
		expect(gridcells).toHaveLength(2);
	});

	it("reflects unselected tabIndex and aria-selected state", () => {
		render(
			<PlaylistItemRow
				item={sampleItem}
				index={1}
				totalItems={3}
				isSelected={false}
				mode="view"
			/>,
		);

		const row = screen.getByRole("row");
		expect(row).toHaveAttribute("tabindex", "-1");
		expect(row).toHaveAttribute("aria-selected", "false");
	});

	it("in view mode, renders Go Live button", () => {
		render(
			<PlaylistItemRow
				item={sampleItem}
				index={0}
				totalItems={3}
				isSelected={true}
				mode="view"
			/>,
		);

		const goLiveBtn = screen.getByRole("button", { name: "Go Live" });
		expect(goLiveBtn).toBeInTheDocument();
		expect(goLiveBtn).toHaveAttribute("tabindex", "-1");
		expect(screen.queryByRole("button", { name: "Move up" })).toBeNull();
		expect(screen.queryByRole("button", { name: "Move down" })).toBeNull();
		expect(screen.queryByRole("button", { name: "Edit item" })).toBeNull();
		expect(screen.queryByRole("button", { name: "Delete item" })).toBeNull();
	});

	it("in edit mode, renders Move Up, Move Down, Edit, Delete buttons with disabled boundary states", () => {
		// First item (index 0 of 3): Move Up should be disabled, Move Down enabled
		const { rerender } = render(
			<PlaylistItemRow
				item={sampleItem}
				index={0}
				totalItems={3}
				isSelected={true}
				mode="edit"
			/>,
		);

		expect(screen.queryByRole("button", { name: "Go Live" })).toBeNull();
		const moveUpFirst = screen.getByRole("button", { name: "Move up" });
		const moveDownFirst = screen.getByRole("button", { name: "Move down" });
		const editBtn = screen.getByRole("button", { name: "Edit item" });
		const deleteBtn = screen.getByRole("button", { name: "Delete item" });

		expect(moveUpFirst).toBeDisabled();
		expect(moveDownFirst).not.toBeDisabled();
		expect(editBtn).toBeInTheDocument();
		expect(deleteBtn).toBeInTheDocument();

		// Last item (index 2 of 3): Move Up enabled, Move Down disabled
		rerender(
			<PlaylistItemRow
				item={sampleItem}
				index={2}
				totalItems={3}
				isSelected={true}
				mode="edit"
			/>,
		);

		const moveUpLast = screen.getByRole("button", { name: "Move up" });
		const moveDownLast = screen.getByRole("button", { name: "Move down" });
		expect(moveUpLast).not.toBeDisabled();
		expect(moveDownLast).toBeDisabled();
	});

	it("clicking Edit button calls startEditingItem", async () => {
		const user = userEvent.setup();
		render(
			<PlaylistItemRow
				item={sampleItem}
				index={0}
				totalItems={3}
				isSelected={true}
				mode="edit"
			/>,
		);

		expect(usePlaylistStore.getState().editingItemId).toBeNull();
		const editBtn = screen.getByRole("button", { name: "Edit item" });
		await user.click(editBtn);

		expect(usePlaylistStore.getState().editingItemId).toBe("item-1");
	});

	it("clicking Move Up / Move Down calls onMoveUp / onMoveDown", async () => {
		const user = userEvent.setup();
		const onMoveUp = mock();
		const onMoveDown = mock();

		render(
			<PlaylistItemRow
				item={sampleItem}
				index={1}
				totalItems={3}
				isSelected={true}
				mode="edit"
				onMoveUp={onMoveUp}
				onMoveDown={onMoveDown}
			/>,
		);

		const moveUpBtn = screen.getByRole("button", { name: "Move up" });
		const moveDownBtn = screen.getByRole("button", { name: "Move down" });

		await user.click(moveUpBtn);
		expect(onMoveUp).toHaveBeenCalledTimes(1);
		expect(onMoveUp).toHaveBeenCalledWith("item-1", 1);

		await user.click(moveDownBtn);
		expect(onMoveDown).toHaveBeenCalledTimes(1);
		expect(onMoveDown).toHaveBeenCalledWith("item-1", 1);
	});

	it("clicking Delete button calls onRequestDelete with trigger element", async () => {
		const user = userEvent.setup();
		const onRequestDelete = mock();

		render(
			<PlaylistItemRow
				item={sampleItem}
				index={0}
				totalItems={3}
				isSelected={true}
				mode="edit"
				onRequestDelete={onRequestDelete}
			/>,
		);

		const deleteBtn = screen.getByRole("button", { name: "Delete item" });
		await user.click(deleteBtn);

		expect(onRequestDelete).toHaveBeenCalledTimes(1);
		expect(onRequestDelete).toHaveBeenCalledWith("item-1", deleteBtn);
	});

	it("clicking row selects item and closes delete confirm in store", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({
			selectedItemId: "item-2",
			activeConfirmDeleteId: "item-2",
		});

		render(
			<PlaylistItemRow
				item={sampleItem}
				index={0}
				totalItems={3}
				isSelected={false}
				mode="view"
			/>,
		);

		const row = screen.getByRole("row");
		await user.click(row);
		expect(usePlaylistStore.getState().selectedItemId).toBe("item-1");
		expect(usePlaylistStore.getState().activeConfirmDeleteId).toBeNull();
	});

	it("delegates keyboard events on row and action cell", async () => {
		const user = userEvent.setup();
		const onKeyDown = mock();
		const onActionCellKeyDown = mock();

		render(
			<PlaylistItemRow
				item={sampleItem}
				index={0}
				totalItems={3}
				isSelected={true}
				mode="view"
				onKeyDown={onKeyDown}
				onActionCellKeyDown={onActionCellKeyDown}
			/>,
		);

		const row = screen.getByRole("row");
		act(() => {
			row.focus();
		});
		await user.keyboard("{ArrowDown}");
		expect(onKeyDown).toHaveBeenCalledTimes(1);

		const gridcells = within(row).getAllByRole("gridcell");
		const actionCell = gridcells[1];
		act(() => {
			actionCell.focus();
		});
		await user.keyboard("{ArrowLeft}");
		expect(onActionCellKeyDown).toHaveBeenCalledTimes(1);
	});

	it("opening context menu renders all items, disabled states, and shortcuts", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({
			selectedItemId: "item-2",
			activeConfirmDeleteId: "item-2",
		});

		const { rerender } = render(
			<PlaylistItemRow
				item={sampleItem}
				index={0}
				totalItems={3}
				isSelected={true}
				mode="view"
			/>,
		);

		const row = screen.getByRole("row");
		await user.pointer({ keys: "[MouseRight]", target: row });

		expect(usePlaylistStore.getState().selectedItemId).toBe("item-1");
		expect(usePlaylistStore.getState().activeConfirmDeleteId).toBeNull();

		const menu = await screen.findByRole("menu");
		expect(menu).toBeInTheDocument();

		const menuItems = within(menu).getAllByRole("menuitem");
		expect(menuItems).toHaveLength(7);

		// 1. Go Live
		expect(menuItems[0]).toHaveTextContent("Go Live");
		// 2. Edit Item
		expect(menuItems[1]).toHaveTextContent("Edit Item");
		expect(menuItems[1]).toHaveTextContent("E");
		// 3. Move Up (index 0 -> disabled)
		expect(menuItems[2]).toHaveTextContent("Move Up");
		expect(menuItems[2]).toHaveTextContent("Alt+↑");
		expect(menuItems[2]).toHaveAttribute("aria-disabled", "true");
		// 4. Move Down
		expect(menuItems[3]).toHaveTextContent("Move Down");
		expect(menuItems[3]).toHaveTextContent("Alt+↓");
		expect(menuItems[3]).not.toHaveAttribute("aria-disabled", "true");
		// 5. Delete Item
		expect(menuItems[4]).toHaveTextContent("Delete Item");
		expect(menuItems[4]).toHaveTextContent("Del");
		expect(menuItems[4]).toHaveAttribute("data-variant", "destructive");
		// 6. Add Item
		expect(menuItems[5]).toHaveTextContent("Add Item");
		// 7. Organize Playlist
		expect(menuItems[6]).toHaveTextContent("Organize Playlist");

		await user.keyboard("{Escape}");

		// Check edit mode label in context menu
		rerender(
			<PlaylistItemRow
				item={sampleItem}
				index={0}
				totalItems={3}
				isSelected={true}
				mode="edit"
			/>,
		);

		await user.pointer({ keys: "[MouseRight]", target: row });
		const editMenu = await screen.findByRole("menu");
		expect(within(editMenu).getByText("Done Organizing")).toBeInTheDocument();
	});

	it("passes ref callbacks the appropriate DOM elements", () => {
		let rowEl: HTMLDivElement | null = null;
		let actionCellEl: HTMLDivElement | null = null;
		let moveUpEl: HTMLButtonElement | null = null;
		let moveDownEl: HTMLButtonElement | null = null;
		let deleteTriggerEl: HTMLButtonElement | null = null;

		render(
			<PlaylistItemRow
				item={sampleItem}
				index={0}
				totalItems={3}
				isSelected={true}
				mode="edit"
				onRegisterRow={(id, node) => {
					expect(id).toBe("item-1");
					rowEl = node;
				}}
				onRegisterActionCell={(id, node) => {
					expect(id).toBe("item-1");
					actionCellEl = node;
				}}
				onRegisterMoveUp={(id, node) => {
					expect(id).toBe("item-1");
					moveUpEl = node;
				}}
				onRegisterMoveDown={(id, node) => {
					expect(id).toBe("item-1");
					moveDownEl = node;
				}}
				onRegisterDeleteTrigger={(id, node) => {
					expect(id).toBe("item-1");
					deleteTriggerEl = node;
				}}
			/>,
		);

		expect(rowEl).not.toBeNull();
		expect((rowEl as unknown as HTMLElement).getAttribute("role")).toBe("row");

		expect(actionCellEl).not.toBeNull();
		expect((actionCellEl as unknown as HTMLElement).getAttribute("role")).toBe(
			"gridcell",
		);

		expect(moveUpEl).not.toBeNull();
		expect(
			(moveUpEl as unknown as HTMLElement).getAttribute("aria-label"),
		).toBe("Move up");

		expect(moveDownEl).not.toBeNull();
		expect(
			(moveDownEl as unknown as HTMLElement).getAttribute("aria-label"),
		).toBe("Move down");

		expect(deleteTriggerEl).not.toBeNull();
		expect(
			(deleteTriggerEl as unknown as HTMLElement).getAttribute("aria-label"),
		).toBe("Delete item");
	});

	it("pressing 'e' or 'E' keydown on row triggers onKeyDown callback", async () => {
		const user = userEvent.setup();
		const onKeyDown = mock();
		render(
			<PlaylistItemRow
				item={sampleItem}
				index={0}
				totalItems={3}
				isSelected={true}
				mode="view"
				onKeyDown={onKeyDown}
			/>,
		);

		const row = screen.getByRole("row");
		act(() => {
			row.focus();
		});

		await user.keyboard("e");
		expect(onKeyDown).toHaveBeenCalledTimes(1);

		await user.keyboard("E");
		expect(onKeyDown).toHaveBeenCalledTimes(2);
	});

	it("keyboard Shift+F10 on row delegates to onKeyDown callback", async () => {
		const user = userEvent.setup();
		const onKeyDown = mock();
		render(
			<PlaylistItemRow
				item={sampleItem}
				index={0}
				totalItems={3}
				isSelected={true}
				mode="view"
				onKeyDown={onKeyDown}
			/>,
		);

		const row = screen.getByRole("row");
		act(() => {
			row.focus();
		});

		await user.keyboard("{Shift>}{F10}{/Shift}");
		// Shift down emits keydown for Shift, then F10 emits keydown for F10 (with shiftKey true)
		expect(onKeyDown).toHaveBeenCalledWith(
			expect.objectContaining({ key: "F10", shiftKey: true }),
			"item-1",
			0,
		);
	});

	it("context menu item 'Add Item' calls insertItemAfter", async () => {
		const user = userEvent.setup();
		render(
			<PlaylistItemRow
				item={sampleItem}
				index={0}
				totalItems={3}
				isSelected={true}
				mode="view"
			/>,
		);

		const row = screen.getByRole("row");
		await user.pointer({ keys: "[MouseRight]", target: row });

		const menu = await screen.findByRole("menu");
		const addItemBtn = within(menu).getByRole("menuitem", {
			name: /add item/i,
		});
		await user.click(addItemBtn);

		const items = usePlaylistStore.getState().items;
		expect(items).toHaveLength(4);
		expect(items[1].title).toBe("(Untitled)");
		expect(usePlaylistStore.getState().selectedItemId).toBe(items[1].id);
	});

	it("context menu item 'Edit Item' calls startEditingItem", async () => {
		const user = userEvent.setup();
		render(
			<PlaylistItemRow
				item={sampleItem}
				index={0}
				totalItems={3}
				isSelected={true}
				mode="view"
			/>,
		);

		expect(usePlaylistStore.getState().editingItemId).toBeNull();
		const row = screen.getByRole("row");
		await user.pointer({ keys: "[MouseRight]", target: row });

		const menu = await screen.findByRole("menu");
		const editItemBtn = within(menu).getByRole("menuitem", {
			name: /edit item/i,
		});
		await user.click(editItemBtn);

		expect(usePlaylistStore.getState().editingItemId).toBe("item-1");
	});

	it("context menu item 'Delete Item' triggers onRequestDelete with row element", async () => {
		const user = userEvent.setup();
		const onRequestDelete = mock();
		render(
			<PlaylistItemRow
				item={sampleItem}
				index={0}
				totalItems={3}
				isSelected={true}
				mode="view"
				onRequestDelete={onRequestDelete}
			/>,
		);

		const row = screen.getByRole("row");
		await user.pointer({ keys: "[MouseRight]", target: row });

		const menu = await screen.findByRole("menu");
		const deleteItemBtn = within(menu).getByRole("menuitem", {
			name: /delete item/i,
		});
		await user.click(deleteItemBtn);

		expect(onRequestDelete).toHaveBeenCalledTimes(1);
		expect(onRequestDelete).toHaveBeenCalledWith("item-1", row);
	});

	it("context menu closing restores focus to the row", async () => {
		const user = userEvent.setup();
		render(
			<PlaylistItemRow
				item={sampleItem}
				index={0}
				totalItems={3}
				isSelected={true}
				mode="view"
			/>,
		);

		const row = screen.getByRole("row");
		await user.pointer({ keys: "[MouseRight]", target: row });

		const menu = await screen.findByRole("menu");
		expect(menu).toBeInTheDocument();

		await user.keyboard("{Escape}");
		expect(screen.queryByRole("menu")).toBeNull();
		await waitFor(() => {
			expect(row).toHaveFocus();
		});
	});
});
