import { nanoid } from "nanoid";
import { create } from "zustand";

export type PlaylistItem = {
	id: string;
	title: string;
	content: string;
};

export type PlaylistMode = "view" | "edit";

export const INITIAL_PLAYLIST_ITEMS: PlaylistItem[] = [
	{
		id: "item-1",
		title: "Amazing Grace",
		content:
			"Amazing grace! How sweet the sound\nThat saved a wretch like me...",
	},
	{
		id: "item-2",
		title: "Psalm 23",
		content: "The Lord is my shepherd; I shall not want...",
	},
	{
		id: "item-3",
		title: "10,000 Reasons",
		content: "Bless the Lord, O my soul, O my soul\nWorship His holy name...",
	},
];

export type PlaylistState = {
	items: PlaylistItem[];
	selectedItemId: string | null;
	mode: PlaylistMode;
	activeConfirmDeleteId: string | null;
	selectItem: (id: string | null) => void;
	selectPrevious: () => void;
	selectNext: () => void;
	addItem: (title?: string, content?: string) => PlaylistItem;
	moveItemUp: (id: string) => void;
	moveItemDown: (id: string) => void;
	deleteItem: (id: string) => void;
	setMode: (mode: PlaylistMode) => void;
	toggleMode: () => void;
	openDeleteConfirm: (id: string) => void;
	closeDeleteConfirm: () => void;
};

export const usePlaylistStore = create<PlaylistState>()((set, get) => ({
	items: INITIAL_PLAYLIST_ITEMS,
	selectedItemId: "item-1",
	mode: "view",
	activeConfirmDeleteId: null,

	selectItem: (id) => set({ selectedItemId: id }),

	selectPrevious: () => {
		const { items, selectedItemId } = get();
		if (items.length === 0) return;
		const currentIndex = items.findIndex((item) => item.id === selectedItemId);
		if (currentIndex === -1) {
			set({ selectedItemId: items[0].id });
			return;
		}
		const newIndex = Math.max(0, currentIndex - 1);
		set({ selectedItemId: items[newIndex].id });
	},

	selectNext: () => {
		const { items, selectedItemId } = get();
		if (items.length === 0) return;
		const currentIndex = items.findIndex((item) => item.id === selectedItemId);
		if (currentIndex === -1) {
			set({ selectedItemId: items[0].id });
			return;
		}
		const newIndex = Math.min(items.length - 1, currentIndex + 1);
		set({ selectedItemId: items[newIndex].id });
	},

	addItem: (title = "(Untitled)", content = "") => {
		const newItem: PlaylistItem = {
			id: nanoid(),
			title,
			content,
		};
		set((state) => ({
			items: [...state.items, newItem],
			selectedItemId: newItem.id,
		}));
		return newItem;
	},

	moveItemUp: (id) => {
		set((state) => {
			const index = state.items.findIndex((item) => item.id === id);
			if (index <= 0) return state;

			const newItems = [...state.items];
			const [item] = newItems.splice(index, 1);
			newItems.splice(index - 1, 0, item);

			return {
				items: newItems,
				selectedItemId: id,
			};
		});
	},

	moveItemDown: (id) => {
		set((state) => {
			const index = state.items.findIndex((item) => item.id === id);
			if (index === -1 || index >= state.items.length - 1) return state;

			const newItems = [...state.items];
			const [item] = newItems.splice(index, 1);
			newItems.splice(index + 1, 0, item);

			return {
				items: newItems,
				selectedItemId: id,
			};
		});
	},

	deleteItem: (id) => {
		set((state) => {
			const index = state.items.findIndex((item) => item.id === id);
			if (index === -1) return state;

			const newItems = state.items.filter((item) => item.id !== id);
			let nextSelectedId = state.selectedItemId;

			if (state.selectedItemId === id) {
				if (newItems.length === 0) {
					nextSelectedId = null;
				} else if (index < newItems.length) {
					nextSelectedId = newItems[index].id;
				} else {
					nextSelectedId = newItems[newItems.length - 1].id;
				}
			}

			return {
				items: newItems,
				selectedItemId: nextSelectedId,
				activeConfirmDeleteId:
					state.activeConfirmDeleteId === id
						? null
						: state.activeConfirmDeleteId,
			};
		});
	},

	setMode: (mode) => set({ mode }),

	toggleMode: () =>
		set((state) => ({
			mode: state.mode === "view" ? "edit" : "view",
		})),

	openDeleteConfirm: (id) => set({ activeConfirmDeleteId: id }),

	closeDeleteConfirm: () => set({ activeConfirmDeleteId: null }),
}));
