import { beforeEach, describe, expect, it } from "bun:test";
import { INITIAL_PLAYLIST_ITEMS, usePlaylistStore } from "./store";

describe("usePlaylistStore", () => {
	beforeEach(() => {
		usePlaylistStore.setState({
			items: [...INITIAL_PLAYLIST_ITEMS],
			selectedItemId: "item-1",
			mode: "view",
			activeConfirmDeleteId: null,
		});
	});

	it("initializes with default state", () => {
		const state = usePlaylistStore.getState();
		expect(state.items).toHaveLength(3);
		expect(state.items[0]).toEqual({
			id: "item-1",
			title: "Amazing Grace",
			content:
				"Amazing grace! How sweet the sound\nThat saved a wretch like me...",
		});
		expect(state.items[1]).toEqual({
			id: "item-2",
			title: "Psalm 23",
			content: "The Lord is my shepherd; I shall not want...",
		});
		expect(state.items[2]).toEqual({
			id: "item-3",
			title: "10,000 Reasons",
			content: "Bless the Lord, O my soul, O my soul\nWorship His holy name...",
		});
		expect(state.selectedItemId).toBe("item-1");
		expect(state.mode).toBe("view");
		expect(state.activeConfirmDeleteId).toBeNull();
	});

	describe("selection", () => {
		it("selects item by id and can set to null", () => {
			usePlaylistStore.getState().selectItem("item-2");
			expect(usePlaylistStore.getState().selectedItemId).toBe("item-2");

			usePlaylistStore.getState().selectItem(null);
			expect(usePlaylistStore.getState().selectedItemId).toBeNull();
		});

		it("selectPrevious moves selection up and clamps at index 0", () => {
			usePlaylistStore.getState().selectItem("item-3");
			usePlaylistStore.getState().selectPrevious();
			expect(usePlaylistStore.getState().selectedItemId).toBe("item-2");

			usePlaylistStore.getState().selectPrevious();
			expect(usePlaylistStore.getState().selectedItemId).toBe("item-1");

			// Clamped at 0
			usePlaylistStore.getState().selectPrevious();
			expect(usePlaylistStore.getState().selectedItemId).toBe("item-1");
		});

		it("selectPrevious selects first item when selectedItemId is invalid or null", () => {
			usePlaylistStore.getState().selectItem(null);
			usePlaylistStore.getState().selectPrevious();
			expect(usePlaylistStore.getState().selectedItemId).toBe("item-1");
		});

		it("selectPrevious does nothing when playlist is empty", () => {
			usePlaylistStore.setState({ items: [], selectedItemId: null });
			usePlaylistStore.getState().selectPrevious();
			expect(usePlaylistStore.getState().selectedItemId).toBeNull();
		});

		it("selectNext moves selection down and clamps at items.length - 1", () => {
			usePlaylistStore.getState().selectItem("item-1");
			usePlaylistStore.getState().selectNext();
			expect(usePlaylistStore.getState().selectedItemId).toBe("item-2");

			usePlaylistStore.getState().selectNext();
			expect(usePlaylistStore.getState().selectedItemId).toBe("item-3");

			// Clamped at end
			usePlaylistStore.getState().selectNext();
			expect(usePlaylistStore.getState().selectedItemId).toBe("item-3");
		});

		it("selectNext selects first item when selectedItemId is invalid or null", () => {
			usePlaylistStore.getState().selectItem(null);
			usePlaylistStore.getState().selectNext();
			expect(usePlaylistStore.getState().selectedItemId).toBe("item-1");
		});

		it("selectNext does nothing when playlist is empty", () => {
			usePlaylistStore.setState({ items: [], selectedItemId: null });
			usePlaylistStore.getState().selectNext();
			expect(usePlaylistStore.getState().selectedItemId).toBeNull();
		});
	});

	describe("addItem", () => {
		it("appends item with default title and content, selects it, and returns it", () => {
			const newItem = usePlaylistStore.getState().addItem();
			const state = usePlaylistStore.getState();

			expect(state.items).toHaveLength(4);
			expect(state.items[3]).toEqual(newItem);
			expect(newItem.title).toBe("(Untitled)");
			expect(newItem.content).toBe("");
			expect(newItem.id).toBeString();
			expect(newItem.id.length).toBeGreaterThan(0);
			expect(state.selectedItemId).toBe(newItem.id);
		});

		it("appends item with custom title and content", () => {
			const newItem = usePlaylistStore
				.getState()
				.addItem(
					"How Great Thou Art",
					"O Lord, my God, when I in awesome wonder",
				);
			const state = usePlaylistStore.getState();

			expect(state.items).toHaveLength(4);
			expect(newItem.title).toBe("How Great Thou Art");
			expect(newItem.content).toBe("O Lord, my God, when I in awesome wonder");
			expect(state.selectedItemId).toBe(newItem.id);
		});
	});

	describe("reordering", () => {
		it("moveItemUp swaps item with previous item and preserves selection", () => {
			usePlaylistStore.getState().selectItem("item-2");
			usePlaylistStore.getState().moveItemUp("item-2");

			const items = usePlaylistStore.getState().items;
			expect(items.map((i) => i.id)).toEqual(["item-2", "item-1", "item-3"]);
			expect(usePlaylistStore.getState().selectedItemId).toBe("item-2");
		});

		it("moveItemUp does nothing when item is at index 0", () => {
			usePlaylistStore.getState().selectItem("item-1");
			usePlaylistStore.getState().moveItemUp("item-1");

			const items = usePlaylistStore.getState().items;
			expect(items.map((i) => i.id)).toEqual(["item-1", "item-2", "item-3"]);
			expect(usePlaylistStore.getState().selectedItemId).toBe("item-1");
		});

		it("moveItemUp does nothing when id is not found", () => {
			usePlaylistStore.getState().moveItemUp("non-existent");
			const items = usePlaylistStore.getState().items;
			expect(items.map((i) => i.id)).toEqual(["item-1", "item-2", "item-3"]);
		});

		it("moveItemDown swaps item with next item and preserves selection", () => {
			usePlaylistStore.getState().selectItem("item-2");
			usePlaylistStore.getState().moveItemDown("item-2");

			const items = usePlaylistStore.getState().items;
			expect(items.map((i) => i.id)).toEqual(["item-1", "item-3", "item-2"]);
			expect(usePlaylistStore.getState().selectedItemId).toBe("item-2");
		});

		it("moveItemDown does nothing when item is at the end", () => {
			usePlaylistStore.getState().selectItem("item-3");
			usePlaylistStore.getState().moveItemDown("item-3");

			const items = usePlaylistStore.getState().items;
			expect(items.map((i) => i.id)).toEqual(["item-1", "item-2", "item-3"]);
			expect(usePlaylistStore.getState().selectedItemId).toBe("item-3");
		});

		it("moveItemDown does nothing when id is not found", () => {
			usePlaylistStore.getState().moveItemDown("non-existent");
			const items = usePlaylistStore.getState().items;
			expect(items.map((i) => i.id)).toEqual(["item-1", "item-2", "item-3"]);
		});
	});

	describe("deleteItem", () => {
		it("removes middle item and selects item that now occupies that index", () => {
			usePlaylistStore.getState().selectItem("item-2");
			usePlaylistStore.getState().deleteItem("item-2");

			const state = usePlaylistStore.getState();
			expect(state.items.map((i) => i.id)).toEqual(["item-1", "item-3"]);
			expect(state.selectedItemId).toBe("item-3");
		});

		it("removes last item and selects the new last item", () => {
			usePlaylistStore.getState().selectItem("item-3");
			usePlaylistStore.getState().deleteItem("item-3");

			const state = usePlaylistStore.getState();
			expect(state.items.map((i) => i.id)).toEqual(["item-1", "item-2"]);
			expect(state.selectedItemId).toBe("item-2");
		});

		it("removes only remaining item and sets selectedItemId to null", () => {
			usePlaylistStore.setState({
				items: [{ id: "solo", title: "Solo", content: "" }],
				selectedItemId: "solo",
			});

			usePlaylistStore.getState().deleteItem("solo");

			const state = usePlaylistStore.getState();
			expect(state.items).toEqual([]);
			expect(state.selectedItemId).toBeNull();
		});

		it("preserves selection if deleted item was not selected", () => {
			usePlaylistStore.getState().selectItem("item-1");
			usePlaylistStore.getState().deleteItem("item-2");

			const state = usePlaylistStore.getState();
			expect(state.items.map((i) => i.id)).toEqual(["item-1", "item-3"]);
			expect(state.selectedItemId).toBe("item-1");
		});

		it("resets activeConfirmDeleteId if the deleted item was active for delete confirm", () => {
			usePlaylistStore.getState().openDeleteConfirm("item-2");
			expect(usePlaylistStore.getState().activeConfirmDeleteId).toBe("item-2");

			usePlaylistStore.getState().deleteItem("item-2");
			expect(usePlaylistStore.getState().activeConfirmDeleteId).toBeNull();
		});

		it("retains activeConfirmDeleteId if a different item is deleted", () => {
			usePlaylistStore.getState().openDeleteConfirm("item-3");
			usePlaylistStore.getState().deleteItem("item-1");
			expect(usePlaylistStore.getState().activeConfirmDeleteId).toBe("item-3");
		});

		it("does nothing when deleting a non-existent item", () => {
			usePlaylistStore.getState().deleteItem("non-existent");
			expect(usePlaylistStore.getState().items).toHaveLength(3);
		});
	});

	describe("mode and delete confirm controls", () => {
		it("setMode sets mode explicitly", () => {
			usePlaylistStore.getState().setMode("edit");
			expect(usePlaylistStore.getState().mode).toBe("edit");

			usePlaylistStore.getState().setMode("view");
			expect(usePlaylistStore.getState().mode).toBe("view");
		});

		it("toggleMode toggles between view and edit", () => {
			usePlaylistStore.getState().toggleMode();
			expect(usePlaylistStore.getState().mode).toBe("edit");

			usePlaylistStore.getState().toggleMode();
			expect(usePlaylistStore.getState().mode).toBe("view");
		});

		it("openDeleteConfirm and closeDeleteConfirm manage confirm id", () => {
			usePlaylistStore.getState().openDeleteConfirm("item-2");
			expect(usePlaylistStore.getState().activeConfirmDeleteId).toBe("item-2");

			usePlaylistStore.getState().closeDeleteConfirm();
			expect(usePlaylistStore.getState().activeConfirmDeleteId).toBeNull();
		});
	});
});
