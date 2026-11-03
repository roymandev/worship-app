import { afterEach, beforeEach, describe, expect, it } from "bun:test";
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
			activeConfirmDeleteId: null,
			liveItemId: null,
			liveCueIndex: null,
		});
	});

	afterEach(() => {
		cleanup();
	});

	it("renders title and row with proper role='row', aria-selected, tabIndex, and data attributes", () => {
		render(
			<PlaylistItemRow
				item={sampleItem}
				index={0}
				totalItems={3}
				isSelected={true}
			/>,
		);

		const row = screen.getByRole("row");
		expect(row).toBeInTheDocument();
		expect(row).toHaveAttribute("data-item-id", "item-1");
		expect(row).toHaveAttribute("tabindex", "0");
		expect(row).toHaveAttribute("aria-selected", "true");
		expect(row.className).toContain("p-2");
		expect(row.className).not.toContain("px-3");
		expect(within(row).getByText("Amazing Grace")).toBeInTheDocument();

		const gridcells = within(row).getAllByRole("gridcell");
		expect(gridcells).toHaveLength(2);
		expect(gridcells[1]).toHaveAttribute("data-action-cell", "item-1");
	});

	it("renders editing indicator in action cell when isEditing is true", () => {
		render(
			<PlaylistItemRow
				item={sampleItem}
				index={0}
				totalItems={3}
				isSelected={false}
				isEditing={true}
			/>,
		);

		const row = screen.getByRole("row");
		expect(row).toHaveAttribute("data-editing", "true");

		const editingIndicator = screen.getByRole("status", {
			name: "Currently editing in item editor",
		});
		expect(editingIndicator).toBeInTheDocument();
		expect(editingIndicator).toHaveAttribute("role", "status");
		expect(editingIndicator).toHaveAttribute(
			"aria-label",
			"Currently editing in item editor",
		);
		expect(editingIndicator).toHaveAttribute(
			"title",
			"Currently editing in item editor",
		);
		expect(editingIndicator).toHaveAttribute("data-editing-indicator", "true");
		expect(editingIndicator.className).toContain("size-7");
		const icon = editingIndicator.querySelector("svg");
		expect(icon).toBeInTheDocument();
		expect(icon?.getAttribute("class")).toContain("size-4");
		expect(within(editingIndicator).getByText("(editing)")).toBeInTheDocument();
	});

	it("omits editing indicator and attributes when isEditing is false or undefined", () => {
		const { rerender } = render(
			<PlaylistItemRow
				item={sampleItem}
				index={0}
				totalItems={3}
				isSelected={false}
				isEditing={false}
			/>,
		);

		const row = screen.getByRole("row");
		expect(row).not.toHaveAttribute("data-editing");
		expect(
			screen.queryByRole("status", {
				name: "Currently editing in item editor",
			}),
		).toBeNull();
		expect(screen.queryByText("(editing)")).toBeNull();

		rerender(
			<PlaylistItemRow
				item={sampleItem}
				index={0}
				totalItems={3}
				isSelected={false}
			/>,
		);
		expect(row).not.toHaveAttribute("data-editing");
		expect(
			screen.queryByRole("status", {
				name: "Currently editing in item editor",
			}),
		).toBeNull();
		expect(screen.queryByText("(editing)")).toBeNull();
	});

	it("renders editing indicator correctly under isSelected=true", () => {
		render(
			<PlaylistItemRow
				item={sampleItem}
				index={0}
				totalItems={3}
				isSelected={true}
				isEditing={true}
			/>,
		);

		const row = screen.getByRole("row");
		expect(row).toHaveAttribute("data-editing", "true");
		expect(row).toHaveAttribute("aria-selected", "true");

		const editingIndicator = screen.getByRole("status", {
			name: "Currently editing in item editor",
		});
		expect(editingIndicator).toBeInTheDocument();
		expect(within(editingIndicator).getByText("(editing)")).toBeInTheDocument();
	});

	it("preserves keyboard roving and action cell behavior when isEditing is true", async () => {
		const user = userEvent.setup();
		render(
			<PlaylistItemRow
				item={sampleItem}
				index={0}
				totalItems={3}
				isSelected={true}
				isEditing={true}
			/>,
		);

		const row = screen.getByRole("row");
		row.focus();
		expect(document.activeElement).toBe(row);

		// ArrowRight should focus Go Live button in action cell
		await user.keyboard("{ArrowRight}");
		const goLiveBtn = screen.getByRole("button", { name: "Go Live" });
		expect(document.activeElement).toBe(goLiveBtn);

		// ArrowLeft should return focus to the row
		await user.keyboard("{ArrowLeft}");
		expect(document.activeElement).toBe(row);
	});

	it("reflects unselected tabIndex and aria-selected state", () => {
		render(
			<PlaylistItemRow
				item={sampleItem}
				index={1}
				totalItems={3}
				isSelected={false}
			/>,
		);

		const row = screen.getByRole("row");
		expect(row).toHaveAttribute("tabindex", "-1");
		expect(row).toHaveAttribute("aria-selected", "false");
	});

	it("renders only Go Live button in action cell with clean outline icon", () => {
		render(
			<PlaylistItemRow
				item={sampleItem}
				index={0}
				totalItems={3}
				isSelected={true}
			/>,
		);

		const goLiveBtn = screen.getByRole("button", { name: "Go Live" });
		expect(goLiveBtn).toBeInTheDocument();
		expect(goLiveBtn).toHaveAttribute("tabindex", "-1");
		expect(goLiveBtn.className).toContain("size-7");
		const icon = goLiveBtn.querySelector("svg");
		expect(icon).toBeInTheDocument();
		expect(icon?.getAttribute("class")).toContain("size-4");
		expect(screen.queryByRole("button", { name: "Move up" })).toBeNull();
		expect(screen.queryByRole("button", { name: "Move down" })).toBeNull();
		expect(screen.queryByRole("button", { name: "Edit item" })).toBeNull();
		expect(screen.queryByRole("button", { name: "Delete item" })).toBeNull();
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
			/>,
		);

		const row = screen.getByRole("row");
		await user.click(row);
		expect(usePlaylistStore.getState().selectedItemId).toBe("item-1");
		expect(usePlaylistStore.getState().activeConfirmDeleteId).toBeNull();
	});

	it("keyboard shortcuts on row: Alt+ArrowDown, Alt+ArrowUp, Delete, Backspace, F2", async () => {
		const user = userEvent.setup();
		const item2 = INITIAL_PLAYLIST_ITEMS[1]; // index 1

		render(
			<PlaylistItemRow
				item={item2}
				index={1}
				totalItems={3}
				isSelected={true}
			/>,
		);

		const row = screen.getByRole("row");
		act(() => {
			row.focus();
		});

		// Alt+ArrowUp reorders item up unconditionally and retains focus
		await user.keyboard("{Alt>}{ArrowUp}{/Alt}");
		expect(usePlaylistStore.getState().items[0].id).toBe("item-2");
		expect(usePlaylistStore.getState().items[1].id).toBe("item-1");
		expect(row).toHaveFocus();

		// Alt+ArrowDown reorders item down unconditionally and retains focus
		await user.keyboard("{Alt>}{ArrowDown}{/Alt}");
		expect(usePlaylistStore.getState().items[0].id).toBe("item-1");
		expect(usePlaylistStore.getState().items[1].id).toBe("item-2");
		expect(row).toHaveFocus();

		// Bare 'e' and 'E' do NOT trigger startEditingItem
		await user.keyboard("e");
		expect(usePlaylistStore.getState().editingItemId).toBeNull();
		await user.keyboard("{Shift>}e{/Shift}");
		expect(usePlaylistStore.getState().editingItemId).toBeNull();

		// 'Enter' triggers Go Live, NOT startEditingItem
		await user.keyboard("{Enter}");
		expect(usePlaylistStore.getState().editingItemId).toBeNull();
		expect(usePlaylistStore.getState().liveItemId).toBe("item-2");

		// 'F2' starts editing
		await user.keyboard("{F2}");
		expect(usePlaylistStore.getState().editingItemId).toBe("item-2");

		// 'Delete' opens delete confirm
		await user.keyboard("{Delete}");
		expect(usePlaylistStore.getState().activeConfirmDeleteId).toBe("item-2");

		usePlaylistStore.getState().closeDeleteConfirm();
		expect(usePlaylistStore.getState().activeConfirmDeleteId).toBeNull();

		// 'Backspace' opens delete confirm
		await user.keyboard("{Backspace}");
		expect(usePlaylistStore.getState().activeConfirmDeleteId).toBe("item-2");
	});

	it("keyboard roving between row and Go Live button", async () => {
		const user = userEvent.setup();
		const item2 = INITIAL_PLAYLIST_ITEMS[1];

		render(
			<PlaylistItemRow
				item={item2}
				index={1}
				totalItems={3}
				isSelected={true}
			/>,
		);

		const row = screen.getByRole("row");
		act(() => {
			row.focus();
		});

		// ArrowRight from row focuses Go Live button
		await user.keyboard("{ArrowRight}");
		const goLiveBtn = screen.getByRole("button", { name: "Go Live" });
		expect(goLiveBtn).toHaveFocus();

		// ArrowLeft returns focus to row
		await user.keyboard("{ArrowLeft}");
		expect(row).toHaveFocus();

		// ArrowRight again then Escape returns focus to row
		await user.keyboard("{ArrowRight}");
		expect(goLiveBtn).toHaveFocus();
		await user.keyboard("{Escape}");
		expect(row).toHaveFocus();
	});

	it("opening context menu renders all items, disabled states, and shortcuts without Organize Playlist", async () => {
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
				isSelected={true}
			/>,
		);

		const row = screen.getByRole("row");
		await user.pointer({ keys: "[MouseRight]", target: row });

		expect(usePlaylistStore.getState().selectedItemId).toBe("item-1");
		expect(usePlaylistStore.getState().activeConfirmDeleteId).toBeNull();

		const menu = await screen.findByRole("menu");
		expect(menu).toBeInTheDocument();

		const menuItems = within(menu).getAllByRole("menuitem");
		expect(menuItems).toHaveLength(6);

		// 1. Go Live
		expect(menuItems[0]).toHaveTextContent("Go Live");
		// 2. Edit Item
		expect(menuItems[1]).toHaveTextContent("Edit Item");
		expect(menuItems[1]).toHaveTextContent("F2");
		// 3. Move Up (index 0 -> disabled)
		expect(menuItems[2]).toHaveTextContent("Move Up");
		expect(menuItems[2]).toHaveTextContent(/Alt\s*↑/);
		expect(menuItems[2]).toHaveAttribute("aria-disabled", "true");
		// 4. Move Down
		expect(menuItems[3]).toHaveTextContent("Move Down");
		expect(menuItems[3]).toHaveTextContent(/Alt\s*↓/);
		expect(menuItems[3]).not.toHaveAttribute("aria-disabled", "true");
		// 5. Delete Item
		expect(menuItems[4]).toHaveTextContent("Delete Item");
		expect(menuItems[4]).toHaveTextContent(/Del|⌫/);
		expect(menuItems[4]).toHaveAttribute("data-variant", "destructive");
		// 6. Add Item
		expect(menuItems[5]).toHaveTextContent("Add Item");

		// Organize Playlist should NOT exist
		expect(within(menu).queryByText(/organize/i)).toBeNull();
	});

	it("keyboard Shift+F10 on row opens the context menu", async () => {
		const user = userEvent.setup();
		render(
			<PlaylistItemRow
				item={sampleItem}
				index={0}
				totalItems={3}
				isSelected={true}
			/>,
		);

		const row = screen.getByRole("row");
		act(() => {
			row.focus();
		});

		await user.keyboard("{Shift>}{F10}{/Shift}");
		const menu = await screen.findByRole("menu");
		expect(menu).toBeInTheDocument();
		expect(within(menu).getByText("Go Live")).toBeInTheDocument();
	});

	it("context menu item 'Add Item' calls insertItemAfter", async () => {
		const user = userEvent.setup();
		render(
			<PlaylistItemRow
				item={sampleItem}
				index={0}
				totalItems={3}
				isSelected={true}
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

	it("context menu item 'Delete Item' opens delete confirm in store", async () => {
		const user = userEvent.setup();
		render(
			<PlaylistItemRow
				item={sampleItem}
				index={0}
				totalItems={3}
				isSelected={true}
			/>,
		);

		expect(usePlaylistStore.getState().activeConfirmDeleteId).toBeNull();
		const row = screen.getByRole("row");
		await user.pointer({ keys: "[MouseRight]", target: row });

		const menu = await screen.findByRole("menu");
		const deleteItemBtn = within(menu).getByRole("menuitem", {
			name: /delete item/i,
		});
		await user.click(deleteItemBtn);

		expect(usePlaylistStore.getState().activeConfirmDeleteId).toBe("item-1");
	});

	it("context menu closing restores focus to the row", async () => {
		const user = userEvent.setup();
		render(
			<PlaylistItemRow
				item={sampleItem}
				index={0}
				totalItems={3}
				isSelected={true}
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

	it("double-clicking row triggers Go Live", async () => {
		const user = userEvent.setup();
		render(
			<PlaylistItemRow
				item={sampleItem}
				index={0}
				totalItems={3}
				isSelected={true}
			/>,
		);

		const row = screen.getByRole("row");
		await user.dblClick(row);

		expect(usePlaylistStore.getState().liveItemId).toBe("item-1");
	});

	it("clicking Go Live button triggers Go Live", async () => {
		const user = userEvent.setup();
		render(
			<PlaylistItemRow
				item={sampleItem}
				index={0}
				totalItems={3}
				isSelected={true}
			/>,
		);

		const goLiveBtn = screen.getByRole("button", { name: "Go Live" });
		await user.click(goLiveBtn);

		expect(usePlaylistStore.getState().liveItemId).toBe("item-1");
	});

	it("selecting Go Live from context menu triggers Go Live", async () => {
		const user = userEvent.setup();
		render(
			<PlaylistItemRow
				item={sampleItem}
				index={0}
				totalItems={3}
				isSelected={true}
			/>,
		);

		const row = screen.getByRole("row");
		await user.pointer({ keys: "[MouseRight]", target: row });

		const menu = await screen.findByRole("menu");
		const goLiveMenuItem = within(menu).getByRole("menuitem", {
			name: /go live/i,
		});
		await user.click(goLiveMenuItem);

		expect(usePlaylistStore.getState().liveItemId).toBe("item-1");
	});

	it("when item is active live: disables all triggers, replaces Go Live button with active live indicator", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({
			liveItemId: "item-1",
			liveCueIndex: 0,
		});

		render(
			<PlaylistItemRow
				item={sampleItem}
				index={0}
				totalItems={3}
				isSelected={true}
			/>,
		);

		const row = screen.getByRole("row");
		expect(row).toHaveAttribute("data-live", "true");

		// Go Live button should NOT be rendered when isLive
		expect(
			screen.queryByRole("button", { name: "Go Live" }),
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: "Active Live" }),
		).not.toBeInTheDocument();

		// Active Live status indicator rendered instead
		const liveIndicator = screen.getByRole("status", {
			name: "Currently live in presentation",
		});
		expect(liveIndicator).toBeInTheDocument();
		expect(liveIndicator).toHaveAttribute("role", "status");
		expect(liveIndicator).toHaveAttribute(
			"aria-label",
			"Currently live in presentation",
		);
		expect(liveIndicator).toHaveAttribute(
			"title",
			"Currently live in presentation",
		);
		expect(liveIndicator).toHaveAttribute("data-live-indicator", "true");
		expect(liveIndicator.className).toContain("size-7");
		const icon = liveIndicator.querySelector("svg");
		expect(icon).toBeInTheDocument();
		expect(icon?.getAttribute("class")).toContain("size-4");
		expect(within(liveIndicator).getByText("(live)")).toBeInTheDocument();

		// Double clicking does not change or re-trigger
		await user.dblClick(row);
		expect(usePlaylistStore.getState().liveItemId).toBe("item-1");

		// Enter does not change or re-trigger
		act(() => {
			row.focus();
		});
		await user.keyboard("{Enter}");
		expect(usePlaylistStore.getState().liveItemId).toBe("item-1");

		// Context menu item Go Live is disabled
		await user.pointer({ keys: "[MouseRight]", target: row });
		const menu = await screen.findByRole("menu");
		const goLiveMenuItem = within(menu).getByRole("menuitem", {
			name: /go live/i,
		});
		expect(goLiveMenuItem).toHaveAttribute("aria-disabled", "true");
	});

	it("renders both editing and live status indicators cleanly in slot order when both are active", () => {
		usePlaylistStore.setState({
			liveItemId: "item-1",
			liveCueIndex: 0,
		});

		render(
			<PlaylistItemRow
				item={sampleItem}
				index={0}
				totalItems={3}
				isSelected={true}
				isEditing={true}
			/>,
		);

		const row = screen.getByRole("row");
		const gridcells = within(row).getAllByRole("gridcell");
		const actionCell = gridcells[1];
		expect(actionCell).toBeInTheDocument();

		const statuses = within(actionCell as HTMLElement).getAllByRole("status");
		expect(statuses).toHaveLength(2);

		// Order: Editing indicator in Slot 1 (left), then Live indicator in Slot 2 (right)
		expect(statuses[0]).toHaveAttribute("data-editing-indicator", "true");
		expect(statuses[0]).toHaveAttribute("role", "status");
		expect(statuses[0]).toHaveAttribute(
			"aria-label",
			"Currently editing in item editor",
		);
		expect(statuses[0]).toHaveAttribute(
			"title",
			"Currently editing in item editor",
		);

		expect(statuses[1]).toHaveAttribute("data-live-indicator", "true");
		expect(statuses[1]).toHaveAttribute("role", "status");
		expect(statuses[1]).toHaveAttribute(
			"aria-label",
			"Currently live in presentation",
		);
		expect(statuses[1]).toHaveAttribute(
			"title",
			"Currently live in presentation",
		);

		// No interactive buttons in action cell when live
		const buttons = within(actionCell as HTMLElement).queryAllByRole("button");
		expect(buttons).toHaveLength(0);
	});

	it("renders background image thumbnail when item has background image", () => {
		const itemWithBackground = {
			...sampleItem,
			background: {
				type: "image" as const,
				url: "https://example.com/worship-bg.jpg",
				brightness: 100,
			},
		};

		render(
			<PlaylistItemRow
				item={itemWithBackground}
				index={0}
				totalItems={3}
				isSelected={false}
			/>,
		);

		const row = screen.getByRole("row");
		const gridcells = within(row).getAllByRole("gridcell");
		const titleCell = gridcells[0];

		expect(titleCell.className).toContain("gap-2.5");
		const img = titleCell.querySelector("img");
		expect(img).toBeInTheDocument();
		expect(img).toHaveAttribute("src", "https://example.com/worship-bg.jpg");
		expect(img).toHaveAttribute("alt", "");
		expect(img).toHaveAttribute("aria-hidden", "true");
		expect(img?.className).toContain("object-cover");
		expect(img?.className).toContain("h-10");
		expect(img?.className).toContain("aspect-video");
		expect(img?.className).toContain("rounded-sm");
	});

	it("renders solid color swatch when item has color background", () => {
		const itemWithColorBackground = {
			...sampleItem,
			background: {
				type: "color" as const,
				color: "#1e3a8a",
			},
		};

		render(
			<PlaylistItemRow
				item={itemWithColorBackground}
				index={0}
				totalItems={3}
				isSelected={false}
			/>,
		);

		const row = screen.getByRole("row");
		const gridcells = within(row).getAllByRole("gridcell");
		const titleCell = gridcells[0];

		expect(titleCell.className).toContain("gap-2.5");
		expect(titleCell.querySelector("img")).toBeNull();

		const swatch = titleCell.querySelector('div[aria-hidden="true"]');
		expect(swatch).toBeInTheDocument();
		expect(swatch?.className).toContain("h-10");
		expect(swatch?.className).toContain("aspect-video");
		expect(swatch?.className).toContain("rounded-sm");
		expect(swatch).toHaveStyle({ backgroundColor: "#1e3a8a" });
	});

	it("renders placeholder icon container when item has no background image", () => {
		const itemWithoutBackground = {
			...sampleItem,
			background: undefined,
		};

		render(
			<PlaylistItemRow
				item={itemWithoutBackground}
				index={0}
				totalItems={3}
				isSelected={false}
			/>,
		);

		const row = screen.getByRole("row");
		const gridcells = within(row).getAllByRole("gridcell");
		const titleCell = gridcells[0];

		// No img element rendered
		expect(titleCell.querySelector("img")).toBeNull();

		// Placeholder container is aria-hidden="true"
		const placeholder = titleCell.querySelector('div[aria-hidden="true"]');
		expect(placeholder).toBeInTheDocument();
		expect(placeholder?.className).toContain("h-10");
		expect(placeholder?.className).toContain("aspect-video");
		expect(placeholder?.className).toContain("rounded-sm");
		expect(placeholder?.className).toContain("flex");
		const icon = placeholder?.querySelector("svg");
		expect(icon).toBeInTheDocument();
		expect(icon?.getAttribute("class")).toContain("size-4");
	});

	it("renders placeholder icon container when item background is null", () => {
		const itemWithNullBackground = {
			...sampleItem,
			background: null,
		};

		render(
			<PlaylistItemRow
				item={itemWithNullBackground}
				index={0}
				totalItems={3}
				isSelected={false}
			/>,
		);

		const row = screen.getByRole("row");
		const gridcells = within(row).getAllByRole("gridcell");
		const titleCell = gridcells[0];

		expect(titleCell.querySelector("img")).toBeNull();
		const placeholder = titleCell.querySelector('div[aria-hidden="true"]');
		expect(placeholder).toBeInTheDocument();
		expect(placeholder?.className).toContain("h-10");
		expect(placeholder?.className).toContain("aspect-video");
		expect(placeholder?.className).toContain("rounded-sm");
		const icon = placeholder?.querySelector("svg");
		expect(icon).toBeInTheDocument();
		expect(icon?.getAttribute("class")).toContain("size-4");
	});
});
