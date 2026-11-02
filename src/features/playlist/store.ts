import { nanoid } from "nanoid";
import { create } from "zustand";
import { parseCues } from "./cues";

export type PlaylistItem = {
	id: string;
	title: string;
	content: string;
};

export type PlaylistItemDraft = Pick<PlaylistItem, "title" | "content">;

export const INITIAL_PLAYLIST_ITEMS: PlaylistItem[] = [
	{
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
	},
	{
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
	},
	{
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
	},
];

export type HydrationStatus = "idle" | "hydrating" | "ready" | "error";

export const INITIAL_PLAYLIST_STATE = {
	items: INITIAL_PLAYLIST_ITEMS,
	selectedItemId: INITIAL_PLAYLIST_ITEMS[0]?.id ?? null,
	selectedCueIndex: 0,
	liveItemId: null,
	liveCueIndex: null,
	isLiveClear: false,
	isLiveBlackout: false,
	editingItemId: null,
	activeConfirmDeleteId: null,
	hydrationStatus: "idle" as HydrationStatus,
} as const;

export type PlaylistState = {
	items: PlaylistItem[];
	selectedItemId: string | null;
	selectedCueIndex: number | null;
	liveItemId: string | null;
	liveCueIndex: number | null;
	isLiveClear: boolean;
	isLiveBlackout: boolean;
	editingItemId: string | null;
	activeConfirmDeleteId: string | null;
	hydrationStatus: HydrationStatus;
	setHydrationStatus: (status: HydrationStatus) => void;
	setHydratedItems: (items: PlaylistItem[]) => void;
	selectItem: (id: string | null) => void;
	selectPrevious: () => void;
	selectNext: () => void;
	selectCue: {
		(target: "stage" | "live", index: number | null): void;
		(index: number | null): void;
	};
	navigateCue: (
		target: "stage" | "live",
		direction: "prev" | "next" | "first" | "last",
	) => void;
	selectPreviousCue: () => void;
	selectNextCue: () => void;
	goLive: (itemId: string, cueIndex?: number) => void;
	selectLiveCue: (index: number) => void;
	selectPreviousLiveCue: () => void;
	selectNextLiveCue: () => void;
	clearLive: () => void;
	toggleLiveClear: () => void;
	setLiveClear: (cleared: boolean) => void;
	toggleLiveBlackout: () => void;
	setLiveBlackout: (blackout: boolean) => void;
	addItem: (title?: string, content?: string) => PlaylistItem;
	insertItemAfter: (
		targetId: string,
		title?: string,
		content?: string,
	) => PlaylistItem;
	moveItemUp: (id: string) => void;
	moveItemDown: (id: string) => void;
	deleteItem: (id: string) => void;
	startEditingItem: (id: string) => void;
	stopEditingItem: () => void;
	updateItem: (id: string, updates: PlaylistItemDraft) => void;
	openDeleteConfirm: (id: string) => void;
	closeDeleteConfirm: () => void;
};

export const usePlaylistStore = create<PlaylistState>()((set, get) => ({
	...INITIAL_PLAYLIST_STATE,

	setHydrationStatus: (status) =>
		set({
			hydrationStatus: status,
		}),

	setHydratedItems: (items) => {
		const { selectedItemId, selectedCueIndex, liveItemId, liveCueIndex } =
			get();

		let nextSelectedId: string | null = null;
		let nextSelectedCueIndex: number | null = null;
		let nextLiveId: string | null = null;
		let nextLiveCueIndex: number | null = null;

		if (items.length > 0) {
			const matchingItem = items.find((i) => i.id === selectedItemId);
			const targetItem = matchingItem ?? items[0];
			nextSelectedId = targetItem.id;
			const cues = parseCues(targetItem.content);
			if (cues.length > 0) {
				if (matchingItem && selectedCueIndex !== null) {
					nextSelectedCueIndex = Math.min(selectedCueIndex, cues.length - 1);
				} else {
					nextSelectedCueIndex = 0;
				}
			} else {
				nextSelectedCueIndex = null;
			}
		}

		if (liveItemId !== null) {
			const matchingLiveItem = items.find((i) => i.id === liveItemId);
			if (matchingLiveItem) {
				nextLiveId = matchingLiveItem.id;
				const liveCues = parseCues(matchingLiveItem.content);
				if (liveCues.length > 0) {
					nextLiveCueIndex =
						liveCueIndex !== null
							? Math.min(liveCueIndex, liveCues.length - 1)
							: 0;
				} else {
					nextLiveCueIndex = null;
				}
			}
		}

		set({
			items,
			selectedItemId: nextSelectedId,
			selectedCueIndex: nextSelectedCueIndex,
			liveItemId: nextLiveId,
			liveCueIndex: nextLiveCueIndex,
		});
	},

	selectItem: (id) => {
		const { items } = get();
		const item = id ? items.find((i) => i.id === id) : null;
		const hasCues = item ? parseCues(item.content).length > 0 : false;
		set({
			selectedItemId: id,
			selectedCueIndex: hasCues ? 0 : null,
		});
	},

	selectPrevious: () => {
		const { items, selectedItemId } = get();
		if (items.length === 0) return;
		const currentIndex = items.findIndex((item) => item.id === selectedItemId);
		if (currentIndex === -1) {
			const firstItem = items[0];
			const hasCues = parseCues(firstItem.content).length > 0;
			set({
				selectedItemId: firstItem.id,
				selectedCueIndex: hasCues ? 0 : null,
			});
			return;
		}
		const newIndex = Math.max(0, currentIndex - 1);
		const targetItem = items[newIndex];
		const hasCues = parseCues(targetItem.content).length > 0;
		set({
			selectedItemId: targetItem.id,
			selectedCueIndex: hasCues ? 0 : null,
		});
	},

	selectNext: () => {
		const { items, selectedItemId } = get();
		if (items.length === 0) return;
		const currentIndex = items.findIndex((item) => item.id === selectedItemId);
		if (currentIndex === -1) {
			const firstItem = items[0];
			const hasCues = parseCues(firstItem.content).length > 0;
			set({
				selectedItemId: firstItem.id,
				selectedCueIndex: hasCues ? 0 : null,
			});
			return;
		}
		const newIndex = Math.min(items.length - 1, currentIndex + 1);
		const targetItem = items[newIndex];
		const hasCues = parseCues(targetItem.content).length > 0;
		set({
			selectedItemId: targetItem.id,
			selectedCueIndex: hasCues ? 0 : null,
		});
	},

	selectCue: ((...args: [unknown, unknown?]) => {
		let target: "stage" | "live" = "stage";
		let targetIndex: number | null = null;

		if (args.length === 1) {
			if (args[0] === null || typeof args[0] === "number") {
				target = "stage";
				targetIndex = args[0];
			}
		} else if (args.length >= 2) {
			if (args[0] === "stage" || args[0] === "live") {
				target = args[0];
			}
			if (args[1] === null || typeof args[1] === "number") {
				targetIndex = args[1];
			}
		}

		const { items, selectedItemId, liveItemId } = get();
		const currentItemId = target === "stage" ? selectedItemId : liveItemId;
		if (currentItemId === null) {
			if (target === "stage") {
				set({ selectedCueIndex: null });
			} else {
				set({ liveCueIndex: null });
			}
			return;
		}

		const currentItem = items.find((item) => item.id === currentItemId);
		if (!currentItem) {
			if (target === "stage") {
				set({ selectedCueIndex: null });
			} else {
				set({ liveCueIndex: null });
			}
			return;
		}

		const cues = parseCues(currentItem.content);
		if (cues.length === 0) {
			if (target === "stage") {
				set({ selectedCueIndex: null });
			} else {
				set({ liveCueIndex: null });
			}
			return;
		}

		let nextIndex: number | null = null;
		if (targetIndex !== null) {
			nextIndex = Math.max(0, Math.min(cues.length - 1, targetIndex));
		}

		if (target === "stage") {
			set({ selectedCueIndex: nextIndex });
		} else {
			set({ liveCueIndex: nextIndex, isLiveClear: false });
		}
	}) as PlaylistState["selectCue"],

	navigateCue: (target, direction) => {
		const {
			items,
			selectedItemId,
			selectedCueIndex,
			liveItemId,
			liveCueIndex,
		} = get();
		const currentItemId = target === "stage" ? selectedItemId : liveItemId;
		const currentCueIndex =
			target === "stage" ? selectedCueIndex : liveCueIndex;

		if (currentItemId === null) return;
		const currentItem = items.find((item) => item.id === currentItemId);
		if (!currentItem) return;

		const cues = parseCues(currentItem.content);
		if (cues.length === 0) {
			if (target === "stage") {
				set({ selectedCueIndex: null });
			} else {
				set({ liveCueIndex: null });
			}
			return;
		}

		let nextIndex: number;
		switch (direction) {
			case "prev": {
				if (currentCueIndex === null) {
					nextIndex = 0;
				} else {
					nextIndex = Math.max(0, currentCueIndex - 1);
				}
				break;
			}
			case "next": {
				if (currentCueIndex === null) {
					nextIndex = 0;
				} else {
					nextIndex = Math.min(cues.length - 1, currentCueIndex + 1);
				}
				break;
			}
			case "first": {
				nextIndex = 0;
				break;
			}
			case "last": {
				nextIndex = cues.length - 1;
				break;
			}
		}

		if (target === "stage") {
			set({ selectedCueIndex: nextIndex });
		} else {
			set({ liveCueIndex: nextIndex, isLiveClear: false });
		}
	},

	selectPreviousCue: () => {
		get().navigateCue("stage", "prev");
	},

	selectNextCue: () => {
		get().navigateCue("stage", "next");
	},

	goLive: (itemId, cueIndex) => {
		const { items, selectedItemId, selectedCueIndex } = get();
		const item = items.find((i) => i.id === itemId);
		if (!item) return;

		let targetCueIndex: number | null = null;
		const cues = parseCues(item.content);
		if (cues.length > 0) {
			if (cueIndex !== undefined) {
				targetCueIndex = Math.max(0, Math.min(cues.length - 1, cueIndex));
			} else if (selectedItemId === itemId) {
				targetCueIndex =
					selectedCueIndex !== null
						? Math.max(0, Math.min(cues.length - 1, selectedCueIndex))
						: 0;
			} else {
				targetCueIndex = 0;
			}
		}

		set({
			liveItemId: itemId,
			liveCueIndex: targetCueIndex,
			isLiveClear: false,
		});
	},

	selectLiveCue: (index) => {
		get().selectCue("live", index);
	},

	selectPreviousLiveCue: () => {
		get().navigateCue("live", "prev");
	},

	selectNextLiveCue: () => {
		get().navigateCue("live", "next");
	},

	clearLive: () => {
		set({
			liveItemId: null,
			liveCueIndex: null,
			isLiveClear: false,
		});
	},

	toggleLiveClear: () => {
		set((state) => ({
			isLiveClear: !state.isLiveClear,
		}));
	},

	setLiveClear: (cleared) => {
		set({
			isLiveClear: cleared,
		});
	},

	toggleLiveBlackout: () => {
		set((state) => ({
			isLiveBlackout: !state.isLiveBlackout,
		}));
	},

	setLiveBlackout: (blackout) => {
		set({
			isLiveBlackout: blackout,
		});
	},

	addItem: (title = "(Untitled)", content = "") => {
		const newItem: PlaylistItem = {
			id: nanoid(),
			title,
			content,
		};
		const hasCues = parseCues(newItem.content).length > 0;
		set((state) => ({
			items: [...state.items, newItem],
			selectedItemId: newItem.id,
			selectedCueIndex: hasCues ? 0 : null,
			editingItemId: newItem.id,
		}));
		return newItem;
	},

	insertItemAfter: (targetId, title = "(Untitled)", content = "") => {
		const newItem: PlaylistItem = {
			id: nanoid(),
			title,
			content,
		};
		const hasCues = parseCues(newItem.content).length > 0;
		set((state) => {
			const targetIndex = state.items.findIndex((item) => item.id === targetId);
			let nextItems: PlaylistItem[];
			if (targetIndex !== -1) {
				nextItems = [
					...state.items.slice(0, targetIndex + 1),
					newItem,
					...state.items.slice(targetIndex + 1),
				];
			} else {
				nextItems = [...state.items, newItem];
			}
			return {
				items: nextItems,
				selectedItemId: newItem.id,
				selectedCueIndex: hasCues ? 0 : null,
				editingItemId: newItem.id,
			};
		});
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

			let nextSelectedCueIndex = state.selectedCueIndex;
			if (state.selectedItemId === id) {
				if (nextSelectedId === null) {
					nextSelectedCueIndex = null;
				} else {
					const nextSelectedItem = newItems.find(
						(item) => item.id === nextSelectedId,
					);
					const hasCues = nextSelectedItem
						? parseCues(nextSelectedItem.content).length > 0
						: false;
					nextSelectedCueIndex = hasCues ? 0 : null;
				}
			}

			const isDeletingLiveItem = state.liveItemId === id;

			return {
				items: newItems,
				selectedItemId: nextSelectedId,
				selectedCueIndex: nextSelectedCueIndex,
				liveItemId: isDeletingLiveItem ? null : state.liveItemId,
				liveCueIndex: isDeletingLiveItem ? null : state.liveCueIndex,
				isLiveClear: isDeletingLiveItem ? false : state.isLiveClear,
				editingItemId: state.editingItemId === id ? null : state.editingItemId,
				activeConfirmDeleteId:
					state.activeConfirmDeleteId === id
						? null
						: state.activeConfirmDeleteId,
			};
		});
	},

	startEditingItem: (id) => set({ editingItemId: id }),

	stopEditingItem: () => set({ editingItemId: null }),

	updateItem: (id, updates) => {
		set((state) => {
			const index = state.items.findIndex((item) => item.id === id);
			if (index === -1) return state;

			const newItems = [...state.items];
			newItems[index] = {
				...newItems[index],
				...updates,
			};

			let nextSelectedCueIndex = state.selectedCueIndex;
			let nextLiveCueIndex = state.liveCueIndex;
			const updatedCues = parseCues(newItems[index].content);

			if (state.selectedItemId === id) {
				if (updatedCues.length === 0) {
					nextSelectedCueIndex = null;
				} else {
					const currentIndex = state.selectedCueIndex ?? 0;
					nextSelectedCueIndex = Math.min(currentIndex, updatedCues.length - 1);
				}
			}

			if (state.liveItemId === id) {
				if (updatedCues.length === 0) {
					nextLiveCueIndex = null;
				} else {
					const currentIndex = state.liveCueIndex ?? 0;
					nextLiveCueIndex = Math.min(currentIndex, updatedCues.length - 1);
				}
			}

			return {
				items: newItems,
				selectedCueIndex: nextSelectedCueIndex,
				liveCueIndex: nextLiveCueIndex,
			};
		});
	},

	openDeleteConfirm: (id) => set({ activeConfirmDeleteId: id }),

	closeDeleteConfirm: () => set({ activeConfirmDeleteId: null }),
}));

export type PlaylistStore = typeof usePlaylistStore;

export const selectIsHydrated = (
	s: PlaylistState | ReturnType<PlaylistStore["getState"]>,
): boolean => s.hydrationStatus === "ready";

export { useCueListCursor } from "./use-cue-list-cursor";
