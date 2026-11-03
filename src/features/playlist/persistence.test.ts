import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { WorshipDatabase } from "@/db/database";
import {
	createPlaylistPersistenceCoordinator,
	PlaylistPersistenceCoordinator,
} from "./persistence";
import {
	INITIAL_PLAYLIST_ITEMS,
	type PlaylistItem,
	selectIsHydrated,
	usePlaylistStore,
} from "./store";

describe("PlaylistPersistenceCoordinator", () => {
	let testDb: WorshipDatabase;
	let coordinator: PlaylistPersistenceCoordinator | null = null;

	beforeEach(async () => {
		testDb = new WorshipDatabase("TestPersistenceCoordinatorDb");
		await testDb.delete();
		await testDb.open();

		usePlaylistStore.setState({
			items: [],
			selectedItemId: null,
			selectedCueIndex: null,
			liveItemId: null,
			liveCueIndex: null,
			editingItemId: null,
			activeConfirmDeleteId: null,
			hydrationStatus: "idle",
		});
	});

	afterEach(async () => {
		if (coordinator) {
			coordinator.destroy();
			coordinator = null;
		}
		if (testDb.isOpen()) {
			await testDb.close();
		}
	});

	it("init() hydrates records and sets isHydrated to true", async () => {
		expect(selectIsHydrated(usePlaylistStore.getState())).toBe(false);
		expect(usePlaylistStore.getState().hydrationStatus).toBe("idle");

		coordinator = createPlaylistPersistenceCoordinator(
			usePlaylistStore,
			testDb,
			{
				debounceMs: 50,
			},
		);

		await coordinator.init();

		const state = usePlaylistStore.getState();
		expect(selectIsHydrated(state)).toBe(true);
		expect(state.hydrationStatus).toBe("ready");
		expect(state.items).toHaveLength(INITIAL_PLAYLIST_ITEMS.length);
	});

	it("debounced writes persist items after timeout", async () => {
		coordinator = new PlaylistPersistenceCoordinator(usePlaylistStore, testDb, {
			debounceMs: 40,
		});
		await coordinator.init();

		const initialItem = usePlaylistStore.getState().items[0];
		expect(initialItem).toBeDefined();

		usePlaylistStore.getState().updateItem(initialItem.id, {
			title: "Updated Title After Debounce",
			content: initialItem.content,
		});

		// Immediately after update, database should still have old title
		const beforeDebounce = await testDb.playlistItems.get(initialItem.id);
		expect(beforeDebounce?.title).toBe(initialItem.title);

		// Wait for debounce window to pass
		await new Promise((resolve) => setTimeout(resolve, 80));

		const afterDebounce = await testDb.playlistItems.get(initialItem.id);
		expect(afterDebounce?.title).toBe("Updated Title After Debounce");
	});

	it("flush() commits debounced writes immediately before debounce timer expires", async () => {
		coordinator = createPlaylistPersistenceCoordinator(
			usePlaylistStore,
			testDb,
			{
				debounceMs: 300,
			},
		);
		await coordinator.init();

		const initialItem = usePlaylistStore.getState().items[0];

		usePlaylistStore.getState().updateItem(initialItem.id, {
			title: "Flushed Immediately Title",
			content: initialItem.content,
		});

		// Database has not been updated yet
		const recordBeforeFlush = await testDb.playlistItems.get(initialItem.id);
		expect(recordBeforeFlush?.title).toBe(initialItem.title);

		// Trigger flush immediately
		await coordinator.flush();

		const recordAfterFlush = await testDb.playlistItems.get(initialItem.id);
		expect(recordAfterFlush?.title).toBe("Flushed Immediately Title");
	});

	it("destroy() unhooks and flushes pending writes", async () => {
		coordinator = createPlaylistPersistenceCoordinator(
			usePlaylistStore,
			testDb,
			{
				debounceMs: 300,
			},
		);
		await coordinator.init();

		const initialItem = usePlaylistStore.getState().items[0];

		usePlaylistStore.getState().updateItem(initialItem.id, {
			title: "Destroy Flushed Title",
			content: initialItem.content,
		});

		// Call destroy() while debounce timer is still pending
		coordinator.destroy();
		coordinator = null;

		// Give short tick for destroy flush microtasks
		await new Promise((resolve) => setTimeout(resolve, 20));

		// Database should have persisted the pending write
		const recordAfterDestroy = await testDb.playlistItems.get(initialItem.id);
		expect(recordAfterDestroy?.title).toBe("Destroy Flushed Title");

		// Subsequent store changes should not be synced because it's destroyed
		usePlaylistStore.getState().addItem("Post Destroy Song", "Lyrics");
		await new Promise((resolve) => setTimeout(resolve, 50));

		const postDestroyItems = await testDb.playlistItems.toArray();
		expect(
			postDestroyItems.some(
				(item: PlaylistItem) => item.title === "Post Destroy Song",
			),
		).toBe(false);
	});

	it("flushes on beforeunload event", async () => {
		coordinator = createPlaylistPersistenceCoordinator(
			usePlaylistStore,
			testDb,
			{
				debounceMs: 500,
			},
		);
		await coordinator.init();

		const initialItem = usePlaylistStore.getState().items[0];

		usePlaylistStore.getState().updateItem(initialItem.id, {
			title: "BeforeUnload Flushed Title",
			content: initialItem.content,
		});

		// Dispatch beforeunload event
		window.dispatchEvent(new Event("beforeunload"));

		// Give short tick for microtasks
		await new Promise((resolve) => setTimeout(resolve, 10));

		const record = await testDb.playlistItems.get(initialItem.id);
		expect(record?.title).toBe("BeforeUnload Flushed Title");
	});

	it("persists background configuration through IndexedDB", async () => {
		coordinator = createPlaylistPersistenceCoordinator(
			usePlaylistStore,
			testDb,
			{
				debounceMs: 50,
			},
		);
		await coordinator.init();

		const initialItem = usePlaylistStore.getState().items[0];

		usePlaylistStore.getState().updateItem(initialItem.id, {
			title: initialItem.title,
			content: initialItem.content,
			background: {
				type: "image",
				url: "https://example.com/test-bg.jpg",
				brightness: 100,
			},
		});

		await coordinator.flush();

		const recordWithBg = await testDb.playlistItems.get(initialItem.id);
		expect(recordWithBg?.background).toEqual({
			type: "image",
			url: "https://example.com/test-bg.jpg",
			brightness: 100,
		});

		// Persist image background with fallback color
		usePlaylistStore.getState().updateItem(initialItem.id, {
			title: initialItem.title,
			content: initialItem.content,
			background: {
				type: "image",
				url: "https://example.com/test-bg.jpg",
				brightness: 90,
				color: "#2e1065",
			},
		});

		await coordinator.flush();

		const recordWithImageColorBg = await testDb.playlistItems.get(
			initialItem.id,
		);
		expect(recordWithImageColorBg?.background).toEqual({
			type: "image",
			url: "https://example.com/test-bg.jpg",
			brightness: 90,
			color: "#2e1065",
		});

		// Persist color background
		usePlaylistStore.getState().updateItem(initialItem.id, {
			title: initialItem.title,
			content: initialItem.content,
			background: {
				type: "color",
				color: "#10b981",
				brightness: 75,
			},
		});

		await coordinator.flush();

		const recordWithColorBg = await testDb.playlistItems.get(initialItem.id);
		expect(recordWithColorBg?.background).toEqual({
			type: "color",
			color: "#10b981",
			brightness: 75,
		});

		// Now clear background
		usePlaylistStore.getState().updateItem(initialItem.id, {
			title: initialItem.title,
			content: initialItem.content,
			background: null,
		});

		await coordinator.flush();

		const recordClearedBg = await testDb.playlistItems.get(initialItem.id);
		expect(recordClearedBg?.background).toBeNull();
	});
});
