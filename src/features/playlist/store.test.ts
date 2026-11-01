import { beforeEach, describe, expect, it } from "bun:test";
import { INITIAL_PLAYLIST_ITEMS, usePlaylistStore } from "./store";

describe("usePlaylistStore", () => {
	beforeEach(() => {
		usePlaylistStore.setState({
			items: [...INITIAL_PLAYLIST_ITEMS],
			selectedItemId: "item-1",
			selectedCueIndex: 0,
			editingItemId: null,
			activeConfirmDeleteId: null,
			previewDraft: null,
		});
	});

	it("initializes with default state", () => {
		const state = usePlaylistStore.getState();
		expect(state.items).toHaveLength(3);
		expect(state.items[0]).toEqual({
			id: "item-1",
			title: "Amazing Grace",
			content: `Amazing grace! How sweet the sound
That saved a wretch like me!
I once was lost, but now am found;
Was blind, but now I see.

'Twas grace that taught my heart to fear,
And grace my fears relieved;
How precious did that grace appear
The hour I first believed.

Through many dangers, toils and snares,
I have already come;
'Tis grace hath brought me safe thus far,
And grace will lead me home.

When we've been there ten thousand years,
Bright shining as the sun,
We've no less days to sing God's praise
Than when we'd first begun.`,
		});
		expect(state.items[1]).toEqual({
			id: "item-2",
			title: "Psalm 23",
			content: `The Lord is my shepherd; I shall not want.
He makes me lie down in green pastures.
He leads me beside still waters.
He restores my soul.

He leads me in paths of righteousness
For His name's sake.
Even though I walk through the valley
Of the shadow of death, I will fear no evil,
For You are with me;
Your rod and Your staff, they comfort me.

You prepare a table before me
In the presence of my enemies;
You anoint my head with oil;
My cup overflows.
Surely goodness and mercy shall follow me
All the days of my life,
And I shall dwell in the house of the Lord forever.`,
		});
		expect(state.items[2]).toEqual({
			id: "item-3",
			title: "10,000 Reasons",
			content: `Bless the Lord, O my soul, O my soul
Worship His holy name
Sing like never before, O my soul
I'll worship Your holy name

The sun comes up, it's a new day dawning
It's time to sing Your song again
Whatever may pass, and whatever lies before me
Let me be singing when the evening comes

You're rich in love, and You're slow to anger
Your name is great, and Your heart is kind
For all Your goodness I will keep on singing
Ten thousand reasons for my heart to find`,
		});
		expect(state.selectedItemId).toBe("item-1");
		expect(state.selectedCueIndex).toBe(0);
		expect(state.editingItemId).toBeNull();
		expect(state.activeConfirmDeleteId).toBeNull();
		expect(state.previewDraft).toBeNull();
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
		it("appends item with default title and content, selects it, sets editingItemId, and returns it", () => {
			const newItem = usePlaylistStore.getState().addItem();
			const state = usePlaylistStore.getState();

			expect(state.items).toHaveLength(4);
			expect(state.items[3]).toEqual(newItem);
			expect(newItem.title).toBe("(Untitled)");
			expect(newItem.content).toBe("");
			expect(newItem.id).toBeString();
			expect(newItem.id.length).toBeGreaterThan(0);
			expect(state.selectedItemId).toBe(newItem.id);
			expect(state.editingItemId).toBe(newItem.id);
		});

		it("appends item with custom title and content and sets editingItemId", () => {
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
			expect(state.editingItemId).toBe(newItem.id);
		});
	});

	describe("insertItemAfter", () => {
		it("inserts item directly after first item and updates selectedItemId and editingItemId", () => {
			const newItem = usePlaylistStore
				.getState()
				.insertItemAfter("item-1", "Inserted Song", "Verse 1");
			const state = usePlaylistStore.getState();

			expect(state.items).toHaveLength(4);
			expect(state.items.map((i) => i.id)).toEqual([
				"item-1",
				newItem.id,
				"item-2",
				"item-3",
			]);
			expect(newItem.title).toBe("Inserted Song");
			expect(newItem.content).toBe("Verse 1");
			expect(state.selectedItemId).toBe(newItem.id);
			expect(state.editingItemId).toBe(newItem.id);
		});

		it("inserts item in the middle of the playlist", () => {
			const newItem = usePlaylistStore
				.getState()
				.insertItemAfter("item-2", "Middle Song", "Middle lyrics");
			const state = usePlaylistStore.getState();

			expect(state.items).toHaveLength(4);
			expect(state.items.map((i) => i.id)).toEqual([
				"item-1",
				"item-2",
				newItem.id,
				"item-3",
			]);
			expect(state.selectedItemId).toBe(newItem.id);
			expect(state.editingItemId).toBe(newItem.id);
		});

		it("inserts item after the last item", () => {
			const newItem = usePlaylistStore
				.getState()
				.insertItemAfter("item-3", "Last Song");
			const state = usePlaylistStore.getState();

			expect(state.items).toHaveLength(4);
			expect(state.items.map((i) => i.id)).toEqual([
				"item-1",
				"item-2",
				"item-3",
				newItem.id,
			]);
			expect(newItem.title).toBe("Last Song");
			expect(newItem.content).toBe("");
			expect(state.selectedItemId).toBe(newItem.id);
			expect(state.editingItemId).toBe(newItem.id);
		});

		it("falls back to appending when targetId is not found", () => {
			const newItem = usePlaylistStore
				.getState()
				.insertItemAfter("non-existent-id");
			const state = usePlaylistStore.getState();

			expect(state.items).toHaveLength(4);
			expect(state.items[3]).toEqual(newItem);
			expect(newItem.title).toBe("(Untitled)");
			expect(newItem.content).toBe("");
			expect(state.selectedItemId).toBe(newItem.id);
			expect(state.editingItemId).toBe(newItem.id);
		});
	});

	describe("editor actions", () => {
		it("defaults editingItemId to null", () => {
			expect(usePlaylistStore.getState().editingItemId).toBeNull();
		});

		it("startEditingItem sets editingItemId", () => {
			usePlaylistStore.getState().startEditingItem("item-2");
			expect(usePlaylistStore.getState().editingItemId).toBe("item-2");
		});

		it("stopEditingItem sets editingItemId to null", () => {
			usePlaylistStore.getState().startEditingItem("item-2");
			expect(usePlaylistStore.getState().editingItemId).toBe("item-2");

			usePlaylistStore.getState().stopEditingItem();
			expect(usePlaylistStore.getState().editingItemId).toBeNull();
		});

		it("updateItem updates title and content for the specified item without modifying other items or order", () => {
			usePlaylistStore.getState().updateItem("item-2", {
				title: "Psalm 23 (Updated)",
				content: "The Lord is my shepherd; I lack nothing.",
			});

			const { items } = usePlaylistStore.getState();
			expect(items).toHaveLength(3);
			expect(items.map((i) => i.id)).toEqual(["item-1", "item-2", "item-3"]);

			expect(items[0]).toEqual(INITIAL_PLAYLIST_ITEMS[0]);
			expect(items[1]).toEqual({
				id: "item-2",
				title: "Psalm 23 (Updated)",
				content: "The Lord is my shepherd; I lack nothing.",
			});
			expect(items[2]).toEqual(INITIAL_PLAYLIST_ITEMS[2]);
		});

		it("updateItem does nothing when id is not found", () => {
			usePlaylistStore.getState().updateItem("non-existent", {
				title: "Ghost",
				content: "Ghost Content",
			});

			const { items } = usePlaylistStore.getState();
			expect(items).toEqual(INITIAL_PLAYLIST_ITEMS);
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

		it("resets editingItemId to null if the deleted item was currently being edited", () => {
			usePlaylistStore.getState().startEditingItem("item-2");
			expect(usePlaylistStore.getState().editingItemId).toBe("item-2");

			usePlaylistStore.getState().deleteItem("item-2");
			expect(usePlaylistStore.getState().editingItemId).toBeNull();
		});

		it("leaves editingItemId unchanged if a different item is deleted", () => {
			usePlaylistStore.getState().startEditingItem("item-3");
			expect(usePlaylistStore.getState().editingItemId).toBe("item-3");

			usePlaylistStore.getState().deleteItem("item-1");
			expect(usePlaylistStore.getState().editingItemId).toBe("item-3");
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

	describe("delete confirm controls", () => {
		it("openDeleteConfirm and closeDeleteConfirm manage confirm id", () => {
			usePlaylistStore.getState().openDeleteConfirm("item-2");
			expect(usePlaylistStore.getState().activeConfirmDeleteId).toBe("item-2");

			usePlaylistStore.getState().closeDeleteConfirm();
			expect(usePlaylistStore.getState().activeConfirmDeleteId).toBeNull();
		});
	});

	describe("cue state and navigation", () => {
		beforeEach(() => {
			usePlaylistStore.setState({
				items: [
					{
						id: "item-multicue",
						title: "Multi Cue Song",
						content: "Cue 1 Line 1\n\nCue 2 Line 1\n\nCue 3 Line 1",
					},
					{
						id: "item-empty-cues",
						title: "Empty Item",
						content: "   \n\n  ",
					},
				],
				selectedItemId: "item-multicue",
				selectedCueIndex: 0,
				editingItemId: null,
				activeConfirmDeleteId: null,
			});
		});

		it("selectCue sets selectedCueIndex directly", () => {
			usePlaylistStore.getState().selectCue(2);
			expect(usePlaylistStore.getState().selectedCueIndex).toBe(2);

			usePlaylistStore.getState().selectCue(null);
			expect(usePlaylistStore.getState().selectedCueIndex).toBeNull();
		});

		it("selectNextCue advances cue and clamps at cues.length - 1", () => {
			expect(usePlaylistStore.getState().selectedCueIndex).toBe(0);

			usePlaylistStore.getState().selectNextCue();
			expect(usePlaylistStore.getState().selectedCueIndex).toBe(1);

			usePlaylistStore.getState().selectNextCue();
			expect(usePlaylistStore.getState().selectedCueIndex).toBe(2);

			// Clamped at 2
			usePlaylistStore.getState().selectNextCue();
			expect(usePlaylistStore.getState().selectedCueIndex).toBe(2);
		});

		it("selectPreviousCue decrements cue and clamps at 0", () => {
			usePlaylistStore.getState().selectCue(2);
			expect(usePlaylistStore.getState().selectedCueIndex).toBe(2);

			usePlaylistStore.getState().selectPreviousCue();
			expect(usePlaylistStore.getState().selectedCueIndex).toBe(1);

			usePlaylistStore.getState().selectPreviousCue();
			expect(usePlaylistStore.getState().selectedCueIndex).toBe(0);

			// Clamped at 0
			usePlaylistStore.getState().selectPreviousCue();
			expect(usePlaylistStore.getState().selectedCueIndex).toBe(0);
		});

		it("selectCue/selectPreviousCue/selectNextCue handle empty or no item safely", () => {
			usePlaylistStore.getState().selectItem("item-empty-cues");
			expect(usePlaylistStore.getState().selectedCueIndex).toBeNull();

			usePlaylistStore.getState().selectNextCue();
			expect(usePlaylistStore.getState().selectedCueIndex).toBeNull();

			usePlaylistStore.getState().selectPreviousCue();
			expect(usePlaylistStore.getState().selectedCueIndex).toBeNull();

			usePlaylistStore.getState().selectItem(null);
			expect(usePlaylistStore.getState().selectedCueIndex).toBeNull();

			usePlaylistStore.getState().selectNextCue();
			expect(usePlaylistStore.getState().selectedCueIndex).toBeNull();
		});

		it("synchronizes selectedCueIndex on selectItem, selectPrevious, and selectNext", () => {
			usePlaylistStore.getState().selectCue(2);
			expect(usePlaylistStore.getState().selectedCueIndex).toBe(2);

			// Switch item with cues -> reset to 0
			usePlaylistStore.getState().selectItem("item-multicue");
			expect(usePlaylistStore.getState().selectedCueIndex).toBe(0);

			// Switch to item without cues -> null
			usePlaylistStore.getState().selectItem("item-empty-cues");
			expect(usePlaylistStore.getState().selectedCueIndex).toBeNull();

			// selectPrevious to multicue -> 0
			usePlaylistStore.getState().selectPrevious();
			expect(usePlaylistStore.getState().selectedItemId).toBe("item-multicue");
			expect(usePlaylistStore.getState().selectedCueIndex).toBe(0);

			// selectNext to empty cues -> null
			usePlaylistStore.getState().selectNext();
			expect(usePlaylistStore.getState().selectedItemId).toBe(
				"item-empty-cues",
			);
			expect(usePlaylistStore.getState().selectedCueIndex).toBeNull();
		});

		it("synchronizes selectedCueIndex on addItem and insertItemAfter", () => {
			const addedWithCues = usePlaylistStore
				.getState()
				.addItem("New Item", "Cue 1\n\nCue 2");
			expect(usePlaylistStore.getState().selectedItemId).toBe(addedWithCues.id);
			expect(usePlaylistStore.getState().selectedCueIndex).toBe(0);

			const addedEmpty = usePlaylistStore.getState().addItem("Empty Item", "");
			expect(usePlaylistStore.getState().selectedItemId).toBe(addedEmpty.id);
			expect(usePlaylistStore.getState().selectedCueIndex).toBeNull();

			const insertedWithCues = usePlaylistStore
				.getState()
				.insertItemAfter(addedEmpty.id, "Inserted Item", "Cue A\n\nCue B");
			expect(usePlaylistStore.getState().selectedItemId).toBe(
				insertedWithCues.id,
			);
			expect(usePlaylistStore.getState().selectedCueIndex).toBe(0);

			const insertedEmpty = usePlaylistStore
				.getState()
				.insertItemAfter(insertedWithCues.id, "Inserted Empty", "   ");
			expect(usePlaylistStore.getState().selectedItemId).toBe(insertedEmpty.id);
			expect(usePlaylistStore.getState().selectedCueIndex).toBeNull();
		});

		it("synchronizes selectedCueIndex on deleteItem", () => {
			usePlaylistStore.getState().selectItem("item-multicue");
			usePlaylistStore.getState().selectCue(2);

			// Deleting item-multicue will select item-empty-cues which has no cues
			usePlaylistStore.getState().deleteItem("item-multicue");
			expect(usePlaylistStore.getState().selectedItemId).toBe(
				"item-empty-cues",
			);
			expect(usePlaylistStore.getState().selectedCueIndex).toBeNull();

			// Deleting item-empty-cues empties the playlist
			usePlaylistStore.getState().deleteItem("item-empty-cues");
			expect(usePlaylistStore.getState().selectedItemId).toBeNull();
			expect(usePlaylistStore.getState().selectedCueIndex).toBeNull();
		});

		it("clamps selectedCueIndex on updateItem when selected item cues shorten or empty", () => {
			usePlaylistStore.getState().selectCue(2);
			expect(usePlaylistStore.getState().selectedCueIndex).toBe(2);

			// Shorten cues to 2 cues (indices 0 and 1)
			usePlaylistStore.getState().updateItem("item-multicue", {
				title: "Updated",
				content: "Cue 1\n\nCue 2",
			});
			expect(usePlaylistStore.getState().selectedCueIndex).toBe(1);

			// Update non-selected item does not change selectedCueIndex
			usePlaylistStore.getState().updateItem("item-empty-cues", {
				title: "Still empty",
				content: "",
			});
			expect(usePlaylistStore.getState().selectedCueIndex).toBe(1);

			// Empty cues on selected item sets selectedCueIndex to null
			usePlaylistStore.getState().updateItem("item-multicue", {
				title: "Updated Empty",
				content: "   ",
			});
			expect(usePlaylistStore.getState().selectedCueIndex).toBeNull();
		});
	});

	describe("previewDraft", () => {
		it("initializes with null previewDraft", () => {
			expect(usePlaylistStore.getState().previewDraft).toBeNull();
		});

		it("updates draft via setPreviewDraft", () => {
			const draft = {
				content: "Draft verse 1\n\nDraft verse 2",
				caretOffset: 15,
			};
			usePlaylistStore.getState().setPreviewDraft(draft);
			expect(usePlaylistStore.getState().previewDraft).toEqual(draft);
		});

		it("clears draft via clearPreviewDraft and setPreviewDraft(null)", () => {
			usePlaylistStore
				.getState()
				.setPreviewDraft({ content: "Testing", caretOffset: 3 });
			expect(usePlaylistStore.getState().previewDraft).not.toBeNull();

			usePlaylistStore.getState().clearPreviewDraft();
			expect(usePlaylistStore.getState().previewDraft).toBeNull();

			usePlaylistStore
				.getState()
				.setPreviewDraft({ content: "Testing 2", caretOffset: 0 });
			usePlaylistStore.getState().setPreviewDraft(null);
			expect(usePlaylistStore.getState().previewDraft).toBeNull();
		});

		it("preserves active previewDraft across cue and item selection transitions", () => {
			const draft = {
				content: "Draft in progress\n\nSecond cue",
				caretOffset: 5,
			};
			usePlaylistStore.getState().setPreviewDraft(draft);

			usePlaylistStore.getState().selectItem("item-2");
			expect(usePlaylistStore.getState().previewDraft).toEqual(draft);

			usePlaylistStore.getState().selectPrevious();
			expect(usePlaylistStore.getState().previewDraft).toEqual(draft);

			usePlaylistStore.getState().selectNext();
			expect(usePlaylistStore.getState().previewDraft).toEqual(draft);

			usePlaylistStore.getState().selectCue(1);
			expect(usePlaylistStore.getState().previewDraft).toEqual(draft);
		});
	});
});
