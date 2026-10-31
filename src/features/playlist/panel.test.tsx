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
			editingItemId: null,
			activeConfirmDeleteId: null,
		});
	});

	afterEach(() => {
		cleanup();
	});

	it("renders the 3 initial dummy items with header containing only Add button", () => {
		render(<PlaylistPanel />);

		expect(
			screen.getByRole("heading", { name: "Playlist" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Add item" }),
		).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /organize|done/i }),
		).not.toBeInTheDocument();

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

	it("renders empty state when all items deleted, and '+ Add Item' restores an item and focuses row", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({ items: [], selectedItemId: null });

		render(<PlaylistPanel />);

		expect(screen.getByText("Playlist is empty")).toBeInTheDocument();
		expect(
			screen.getByText("Add items to build your worship service order."),
		).toBeInTheDocument();
		expect(screen.queryByRole("grid")).not.toBeInTheDocument();

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

	it("shifts focus to empty state Add Item button when deleting the last item", async () => {
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
		});

		render(<PlaylistPanel />);

		const rows = screen.getAllByRole("row");
		rows[0].focus();
		await user.keyboard("{Delete}");

		const confirmDeleteBtn = screen.getByRole("button", { name: "Delete" });
		await user.click(confirmDeleteBtn);

		await waitFor(() => {
			const emptyAddBtn = screen.getByRole("button", { name: "Add Item" });
			expect(emptyAddBtn).toHaveFocus();
		});
	});

	it("reordering items via Alt+ArrowDown / Alt+ArrowUp keyboard shortcuts", async () => {
		const user = userEvent.setup();
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

	it("deleting an item via Delete key triggers popover anchored to row and focuses neighbor row upon confirm", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({ selectedItemId: "item-2" });

		render(<PlaylistPanel />);

		const rows = screen.getAllByRole("row");
		rows[1].focus(); // Psalm 23

		await user.keyboard("{Delete}");

		expect(screen.getByText("Delete this item?")).toBeInTheDocument();
		const cancelBtn = screen.getByRole("button", { name: "Cancel" });
		await waitFor(() => expect(cancelBtn).toHaveFocus());

		const confirmDeleteBtn = screen.getByRole("button", { name: "Delete" });
		await user.click(confirmDeleteBtn);

		const remainingRows = screen.getAllByRole("row");
		expect(remainingRows).toHaveLength(2);
		expect(screen.queryByText("Psalm 23")).not.toBeInTheDocument();
		expect(remainingRows[0]).toHaveTextContent("Amazing Grace");
		expect(remainingRows[1]).toHaveTextContent("10,000 Reasons");
		expect(remainingRows[1]).toHaveFocus();
	});

	it("deleting the last item restores focus to the preceding item", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({ selectedItemId: "item-3" });

		render(<PlaylistPanel />);

		const rows = screen.getAllByRole("row");
		rows[2].focus(); // 10,000 Reasons

		await user.keyboard("{Delete}");

		const confirmDeleteBtn = screen.getByRole("button", { name: "Delete" });
		await user.click(confirmDeleteBtn);

		const remainingRows = screen.getAllByRole("row");
		expect(remainingRows).toHaveLength(2);
		expect(screen.queryByText("10,000 Reasons")).not.toBeInTheDocument();
		expect(remainingRows[1]).toHaveTextContent("Psalm 23");
		expect(remainingRows[1]).toHaveFocus();
	});

	it("dismissing delete confirmation popover restores focus to originating row", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({ selectedItemId: "item-1" });

		render(<PlaylistPanel />);

		const rows = screen.getAllByRole("row");
		rows[0].focus();
		expect(rows[0]).toHaveFocus();

		await user.keyboard("{Delete}");
		expect(screen.getByText("Delete this item?")).toBeInTheDocument();
		const cancelBtn = screen.getByRole("button", { name: "Cancel" });
		await waitFor(() => expect(cancelBtn).toHaveFocus());

		await user.click(cancelBtn);
		expect(screen.queryByText("Delete this item?")).not.toBeInTheDocument();
		expect(rows[0]).toHaveFocus();
	});

	it("dismissing delete confirmation popover via Escape restores focus to originating row", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({ selectedItemId: "item-1" });

		render(<PlaylistPanel />);

		const rows = screen.getAllByRole("row");
		rows[0].focus();
		expect(rows[0]).toHaveFocus();

		await user.keyboard("{Delete}");
		expect(screen.getByText("Delete this item?")).toBeInTheDocument();
		const cancelBtn = screen.getByRole("button", { name: "Cancel" });
		await waitFor(() => expect(cancelBtn).toHaveFocus());

		await user.keyboard("{Escape}");
		expect(screen.queryByText("Delete this item?")).not.toBeInTheDocument();
		expect(rows[0]).toHaveFocus();
	});

	it("traps focus inside the delete confirmation popover and prevents focus leakage", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({ selectedItemId: "item-1" });

		render(<PlaylistPanel />);

		const rows = screen.getAllByRole("row");
		rows[0].focus();
		await user.keyboard("{Delete}");

		expect(screen.getByRole("alertdialog")).toBeInTheDocument();
		expect(screen.getByText("Delete this item?")).toBeInTheDocument();
		const cancelBtn = screen.getByRole("button", { name: "Cancel" });

		await waitFor(() => expect(cancelBtn).toHaveFocus());

		// Verify pressing Shift+Tab inside popover leaves selected item unchanged and focus remains contained
		await user.keyboard("{Shift>}{Tab}{/Shift}");
		expect(usePlaylistStore.getState().selectedItemId).toBe("item-1");
		const confirmDeleteBtn = screen.getByRole("button", { name: "Delete" });
		expect(confirmDeleteBtn).toHaveFocus();

		// Background rows must not have focus
		const domRows = document.querySelectorAll('[role="row"]');
		for (const r of domRows) {
			expect(r).not.toHaveFocus();
		}
	});

	describe("Playlist Panel Context Menu", () => {
		it("right-clicking empty space in the panel opens the panel context menu without Organize Playlist", async () => {
			const user = userEvent.setup();
			const { container } = render(<PlaylistPanel />);

			const viewport = container.querySelector(".overflow-y-auto");
			expect(viewport).toBeInTheDocument();
			if (!viewport) throw new Error("Viewport not found");
			await user.pointer({ keys: "[MouseRight]", target: viewport });

			const menu = await screen.findByRole("menu");
			expect(menu).toBeInTheDocument();

			const menuItems = within(menu).getAllByRole("menuitem");
			expect(menuItems).toHaveLength(1);
			expect(menuItems[0]).toHaveTextContent("Add Item");
			expect(within(menu).queryByText(/organize/i)).toBeNull();
		});

		it("right-clicking empty state placeholder opens the panel context menu without Organize Playlist", async () => {
			const user = userEvent.setup();
			usePlaylistStore.setState({ items: [], selectedItemId: null });

			render(<PlaylistPanel />);

			const emptyStateText = screen.getByText("Playlist is empty");
			await user.pointer({ keys: "[MouseRight]", target: emptyStateText });

			const menu = await screen.findByRole("menu");
			expect(menu).toBeInTheDocument();

			const menuItems = within(menu).getAllByRole("menuitem");
			expect(menuItems).toHaveLength(1);
			expect(menuItems[0]).toHaveTextContent("Add Item");
			expect(within(menu).queryByText(/organize/i)).toBeNull();
		});

		it("right-clicking an item row opens the item context menu, not the panel context menu", async () => {
			const user = userEvent.setup();
			render(<PlaylistPanel />);

			const rows = screen.getAllByRole("row");
			await user.pointer({ keys: "[MouseRight]", target: rows[0] });

			const menu = await screen.findByRole("menu");
			expect(menu).toBeInTheDocument();

			// Item context menu has 6 items (no organize), panel menu has 1
			const menuItems = within(menu).getAllByRole("menuitem");
			expect(menuItems).toHaveLength(6);
			expect(menuItems[0]).toHaveTextContent("Go Live");
		});

		it("clicking 'Add Item' in the panel context menu appends an item to the end of the playlist", async () => {
			const user = userEvent.setup();
			const { container } = render(<PlaylistPanel />);

			const viewport = container.querySelector(".overflow-y-auto");
			expect(viewport).toBeInTheDocument();
			if (!viewport) throw new Error("Viewport not found");
			await user.pointer({ keys: "[MouseRight]", target: viewport });

			const menu = await screen.findByRole("menu");
			const addItemBtn = within(menu).getByRole("menuitem", {
				name: /add item/i,
			});
			await user.click(addItemBtn);

			const items = usePlaylistStore.getState().items;
			expect(items).toHaveLength(4);
			expect(items[3].title).toBe("(Untitled)");
			expect(usePlaylistStore.getState().selectedItemId).toBe(items[3].id);
		});

		it("opening panel context menu dismisses active inline delete confirmation popover", async () => {
			const user = userEvent.setup();
			usePlaylistStore.setState({
				selectedItemId: "item-1",
				activeConfirmDeleteId: "item-1",
			});

			const { container } = render(<PlaylistPanel />);
			expect(screen.getByRole("alertdialog")).toBeInTheDocument();

			const viewport = container.querySelector(".overflow-y-auto");
			expect(viewport).not.toBeNull();
			if (!viewport) throw new Error("Viewport not found");
			await user.pointer({ keys: "[MouseRight]", target: viewport });

			expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
			expect(usePlaylistStore.getState().activeConfirmDeleteId).toBeNull();
		});

		it("pressing F2 keydown on row triggers startEditingItem, whereas bare e/E does not", async () => {
			const user = userEvent.setup();
			render(<PlaylistPanel />);

			expect(usePlaylistStore.getState().editingItemId).toBeNull();
			const rows = screen.getAllByRole("row");
			rows[0].focus();

			await user.keyboard("e");
			expect(usePlaylistStore.getState().editingItemId).toBeNull();

			await user.keyboard("{Shift>}e{/Shift}");
			expect(usePlaylistStore.getState().editingItemId).toBeNull();

			await user.keyboard("{F2}");
			expect(usePlaylistStore.getState().editingItemId).toBe("item-1");
		});

		it("keyboard Shift+F10 on row opens the context menu", async () => {
			const user = userEvent.setup();
			render(<PlaylistPanel />);

			const rows = screen.getAllByRole("row");
			rows[0].focus();

			await user.keyboard("{Shift>}{F10}{/Shift}");

			const menu = await screen.findByRole("menu");
			expect(menu).toBeInTheDocument();
			expect(within(menu).getByText("Go Live")).toBeInTheDocument();
		});
	});
});
