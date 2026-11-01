import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import {
	INITIAL_PLAYLIST_ITEMS,
	usePlaylistStore,
} from "../features/playlist/store";
import { type PlaylistItemRecord, WorshipDatabase } from "./database";
import {
	hydratePlaylistStore,
	METADATA_KEY_HAS_INITIALIZED,
	METADATA_KEY_HAS_USER_CLEARED_PLAYLIST,
	type PersistenceSyncManager,
	startPlaylistPersistence,
} from "./sync";

describe("Playlist Sync & Hydration", () => {
	let testDb: WorshipDatabase;
	let syncManager: PersistenceSyncManager | null = null;

	beforeEach(async () => {
		testDb = new WorshipDatabase("TestSyncDatabase");
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
			previewDraft: null,
			hydrationStatus: "idle",
		});
	});

	afterEach(async () => {
		if (syncManager) {
			syncManager.stop();
			syncManager = null;
		}
		if (testDb.isOpen()) {
			await testDb.close();
		}
	});

	describe("hydratePlaylistStore", () => {
		it("seeds demo data and sets status to ready on fresh database", async () => {
			expect(usePlaylistStore.getState().hydrationStatus).toBe("idle");

			await hydratePlaylistStore(testDb, usePlaylistStore);

			const state = usePlaylistStore.getState();
			expect(state.hydrationStatus).toBe("ready");
			expect(state.items).toHaveLength(INITIAL_PLAYLIST_ITEMS.length);
			expect(state.items[0].title).toBe("Amazing Grace");
			expect(state.selectedItemId).toBe(state.items[0].id);

			const metaInit = await testDb.metadata.get(METADATA_KEY_HAS_INITIALIZED);
			expect(metaInit?.value).toBe(true);
		});

		it("retains empty array on intentionally cleared database without re-seeding", async () => {
			await testDb.metadata.put({
				key: METADATA_KEY_HAS_INITIALIZED,
				value: true,
			});
			await testDb.metadata.put({
				key: METADATA_KEY_HAS_USER_CLEARED_PLAYLIST,
				value: true,
			});

			await hydratePlaylistStore(testDb, usePlaylistStore);

			const state = usePlaylistStore.getState();
			expect(state.hydrationStatus).toBe("ready");
			expect(state.items).toHaveLength(0);
			expect(state.selectedItemId).toBeNull();
		});

		it("loads existing stored items respecting sequential position index", async () => {
			const customItems = [
				{ id: "c-1", title: "Song B", content: "Verse B", position: 1 },
				{ id: "c-0", title: "Song A", content: "Verse A", position: 0 },
			];
			await testDb.playlistItems.bulkAdd(customItems);
			await testDb.metadata.put({
				key: METADATA_KEY_HAS_INITIALIZED,
				value: true,
			});

			await hydratePlaylistStore(testDb, usePlaylistStore);

			const state = usePlaylistStore.getState();
			expect(state.hydrationStatus).toBe("ready");
			expect(state.items).toHaveLength(2);
			expect(state.items[0].id).toBe("c-0");
			expect(state.items[1].id).toBe("c-1");
		});

		it("validates and applies defaults to malformed records during hydration", async () => {
			const malformedRecords = [
				// Missing title and content, non-standard types
				{ id: "valid-1", position: 0 } as unknown as PlaylistItemRecord,
			];
			await testDb.playlistItems.bulkAdd(malformedRecords);
			await testDb.metadata.put({
				key: METADATA_KEY_HAS_INITIALIZED,
				value: true,
			});

			await hydratePlaylistStore(testDb, usePlaylistStore);

			const state = usePlaylistStore.getState();
			expect(state.hydrationStatus).toBe("ready");
			expect(state.items).toHaveLength(1);
			expect(state.items[0].id).toBe("valid-1");
			expect(state.items[0].title).toBe("(Untitled)");
			expect(state.items[0].content).toBe("");
		});

		it("sets status to error when database throws during hydration", async () => {
			await testDb.close(); // Closed database causes error on table query

			expect(hydratePlaylistStore(testDb, usePlaylistStore)).rejects.toThrow();

			expect(usePlaylistStore.getState().hydrationStatus).toBe("error");
		});
	});

	describe("startPlaylistPersistence", () => {
		it("immediately persists item additions", async () => {
			// Hydrate first
			await hydratePlaylistStore(testDb, usePlaylistStore);
			syncManager = startPlaylistPersistence(testDb, usePlaylistStore, 50);

			const newItem = usePlaylistStore
				.getState()
				.addItem("Immediate Song", "Line 1");

			// Let event loop process microtasks
			await new Promise((r) => setTimeout(r, 10));

			const dbRecords = await testDb.playlistItems
				.orderBy("position")
				.toArray();
			expect(dbRecords).toHaveLength(4);
			const lastRecord = dbRecords[dbRecords.length - 1];
			expect(lastRecord.id).toBe(newItem.id);
			expect(lastRecord.title).toBe("Immediate Song");
			expect(lastRecord.position).toBe(3);
		});

		it("immediately persists item reordering and updates position field", async () => {
			await hydratePlaylistStore(testDb, usePlaylistStore);
			syncManager = startPlaylistPersistence(testDb, usePlaylistStore, 50);

			const firstId = usePlaylistStore.getState().items[0].id;
			const secondId = usePlaylistStore.getState().items[1].id;

			usePlaylistStore.getState().moveItemDown(firstId);

			await new Promise((r) => setTimeout(r, 10));

			const dbRecords = await testDb.playlistItems
				.orderBy("position")
				.toArray();
			expect(dbRecords[0].id).toBe(secondId);
			expect(dbRecords[0].position).toBe(0);
			expect(dbRecords[1].id).toBe(firstId);
			expect(dbRecords[1].position).toBe(1);
		});

		it("immediately persists item deletion and updates user cleared flag when empty", async () => {
			await hydratePlaylistStore(testDb, usePlaylistStore);
			syncManager = startPlaylistPersistence(testDb, usePlaylistStore, 50);

			const items = [...usePlaylistStore.getState().items];
			usePlaylistStore.getState().deleteItem(items[0].id);

			await new Promise((r) => setTimeout(r, 10));

			let dbRecords = await testDb.playlistItems.orderBy("position").toArray();
			expect(dbRecords).toHaveLength(2);
			expect(dbRecords.find((r) => r.id === items[0].id)).toBeUndefined();

			// Delete remaining
			usePlaylistStore.getState().deleteItem(items[1].id);
			usePlaylistStore.getState().deleteItem(items[2].id);

			await new Promise((r) => setTimeout(r, 10));

			dbRecords = await testDb.playlistItems.toArray();
			expect(dbRecords).toHaveLength(0);

			const clearedMeta = await testDb.metadata.get(
				METADATA_KEY_HAS_USER_CLEARED_PLAYLIST,
			);
			expect(clearedMeta?.value).toBe(true);
		});

		it("debounces rapid text updates and flushes properly", async () => {
			await hydratePlaylistStore(testDb, usePlaylistStore);
			syncManager = startPlaylistPersistence(testDb, usePlaylistStore, 100);

			const targetId = usePlaylistStore.getState().items[0].id;

			usePlaylistStore.getState().updateItem(targetId, {
				title: "Amazing Grace (v1)",
				content: "Typing...",
			});

			// Immediate check: Should still be original in DB because of debounce
			const immediateRecord = await testDb.playlistItems.get(targetId);
			expect(immediateRecord?.title).toBe("Amazing Grace");

			// Rapid updates
			usePlaylistStore.getState().updateItem(targetId, {
				title: "Amazing Grace (v2)",
				content: "Still typing...",
			});
			usePlaylistStore.getState().updateItem(targetId, {
				title: "Amazing Grace (Final)",
				content: "Done typing.",
			});

			// Advance beyond debounce time
			await new Promise((r) => setTimeout(r, 150));

			const updatedRecord = await testDb.playlistItems.get(targetId);
			expect(updatedRecord?.title).toBe("Amazing Grace (Final)");
			expect(updatedRecord?.content).toBe("Done typing.");
		});

		it("flush immediately resolves pending debounced write", async () => {
			await hydratePlaylistStore(testDb, usePlaylistStore);
			syncManager = startPlaylistPersistence(testDb, usePlaylistStore, 200);

			const targetId = usePlaylistStore.getState().items[0].id;

			usePlaylistStore.getState().updateItem(targetId, {
				title: "Instant Flushed Title",
				content: "Content",
			});

			// Trigger explicit flush before timeout expires
			await syncManager.flush();

			const record = await testDb.playlistItems.get(targetId);
			expect(record?.title).toBe("Instant Flushed Title");
		});
	});
});
