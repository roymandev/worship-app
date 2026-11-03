import { z } from "zod";
import type { PlaylistItem } from "../features/playlist/store";
import { usePlaylistStore } from "../features/playlist/store";
import { db, type PlaylistItemRecord, type WorshipDatabase } from "./database";
import { seedDemoData } from "./seed";

export const METADATA_KEY_HAS_USER_CLEARED_PLAYLIST = "hasUserClearedPlaylist";
export const METADATA_KEY_HAS_INITIALIZED = "hasInitialized";

export const playlistItemRecordSchema = z.object({
	id: z.string().min(1),
	title: z.string().catch("(Untitled)"),
	content: z.string().catch(""),
	position: z.number().int().nonnegative().catch(0),
	background: z
		.discriminatedUnion("type", [
			z.object({
				type: z.literal("image"),
				url: z.string().min(1),
				brightness: z.number().min(0).max(100).default(100),
				color: z.string().optional(),
			}),
			z.object({
				type: z.literal("color"),
				color: z.string().min(1),
				brightness: z.number().min(0).max(100).optional(),
			}),
		])
		.nullable()
		.optional()
		.catch(null),
});

export function parsePlaylistItemRecords(records: unknown[]): PlaylistItem[] {
	return records
		.map((record) => {
			const result = playlistItemRecordSchema.safeParse(record);
			if (!result.success) {
				return null;
			}
			const { id, title, content, background } = result.data;
			return {
				id,
				title,
				content,
				...(background !== undefined ? { background } : {}),
			};
		})
		.filter((item): item is PlaylistItem => item !== null);
}

export async function hydratePlaylistStore(
	database: WorshipDatabase = db,
	store = usePlaylistStore,
): Promise<void> {
	store.getState().setHydrationStatus("hydrating");

	try {
		const existingItems = await database.playlistItems
			.orderBy("position")
			.toArray();

		const hasInitializedMeta = await database.metadata.get(
			METADATA_KEY_HAS_INITIALIZED,
		);
		const hasUserClearedMeta = await database.metadata.get(
			METADATA_KEY_HAS_USER_CLEARED_PLAYLIST,
		);

		const isInitialized = Boolean(
			hasInitializedMeta?.value ?? hasUserClearedMeta,
		);

		if (!isInitialized && existingItems.length === 0) {
			await seedDemoData(database);
			await database.metadata.put({
				key: METADATA_KEY_HAS_INITIALIZED,
				value: true,
			});
			const seededItems = await database.playlistItems
				.orderBy("position")
				.toArray();
			store.getState().setHydratedItems(parsePlaylistItemRecords(seededItems));
		} else {
			if (!hasInitializedMeta) {
				await database.metadata.put({
					key: METADATA_KEY_HAS_INITIALIZED,
					value: true,
				});
			}
			store
				.getState()
				.setHydratedItems(parsePlaylistItemRecords(existingItems));
		}

		store.getState().setHydrationStatus("ready");
	} catch (error) {
		store.getState().setHydrationStatus("error");
		throw error;
	}
}

export interface PersistenceSyncManager {
	stop: () => void;
	flush: () => Promise<void>;
}

export function startPlaylistPersistence(
	database: WorshipDatabase = db,
	store = usePlaylistStore,
	debounceMs = 300,
): PersistenceSyncManager {
	let previousItems: PlaylistItem[] = store.getState().items;
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;
	let pendingDebouncedPromise: Promise<void> | null = null;
	let pendingDebouncedResolver: (() => void) | null = null;

	let pendingItemsToPersist: PlaylistItem[] | null = null;

	const syncRecords = async (
		itemsToSave: PlaylistItem[],
		updateClearedMeta = false,
	): Promise<void> => {
		const currentIds = new Set(itemsToSave.map((item) => item.id));
		const records: PlaylistItemRecord[] = itemsToSave.map((item, index) => ({
			...item,
			position: index,
		}));

		await database.transaction(
			"rw",
			[database.playlistItems, database.metadata],
			async () => {
				const allDbKeys = await database.playlistItems
					.toCollection()
					.primaryKeys();
				const keysToDelete = allDbKeys.filter((id) => !currentIds.has(id));

				if (keysToDelete.length > 0) {
					await database.playlistItems.bulkDelete(keysToDelete);
				}

				if (records.length > 0) {
					await database.playlistItems.bulkPut(records);
				}

				if (updateClearedMeta) {
					await database.metadata.put({
						key: METADATA_KEY_HAS_INITIALIZED,
						value: true,
					});
					await database.metadata.put({
						key: METADATA_KEY_HAS_USER_CLEARED_PLAYLIST,
						value: records.length === 0,
					});
				}
			},
		);
	};

	const executeDebouncedPersist = async (): Promise<void> => {
		if (!pendingItemsToPersist) return;
		const itemsToSave = pendingItemsToPersist;
		pendingItemsToPersist = null;

		await syncRecords(itemsToSave, false);
	};

	const flush = async (): Promise<void> => {
		if (debounceTimer) {
			clearTimeout(debounceTimer);
			debounceTimer = null;
		}
		if (pendingItemsToPersist) {
			try {
				await executeDebouncedPersist();
			} finally {
				const resolver = pendingDebouncedResolver;
				pendingDebouncedResolver = null;
				pendingDebouncedPromise = null;
				resolver?.();
			}
		}
	};

	const persistItemsImmediately = async (
		currentItems: PlaylistItem[],
	): Promise<void> => {
		await syncRecords(currentItems, true);
	};

	const persistUpdatedItemsDebounced = (currentItems: PlaylistItem[]): void => {
		pendingItemsToPersist = currentItems;
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}

		if (!pendingDebouncedPromise) {
			pendingDebouncedPromise = new Promise<void>((resolve) => {
				pendingDebouncedResolver = resolve;
			});
		}

		debounceTimer = setTimeout(async () => {
			debounceTimer = null;
			try {
				await executeDebouncedPersist();
			} finally {
				const resolver = pendingDebouncedResolver;
				pendingDebouncedResolver = null;
				pendingDebouncedPromise = null;
				resolver?.();
			}
		}, debounceMs);
	};

	const unsubscribe = store.subscribe(async (state) => {
		const currentItems = state.items;
		if (currentItems === previousItems) {
			return;
		}

		const isLengthChanged = currentItems.length !== previousItems.length;
		const isOrderOrIdsChanged =
			!isLengthChanged &&
			currentItems.some((item, i) => item.id !== previousItems[i]?.id);

		if (isLengthChanged || isOrderOrIdsChanged) {
			// Structural change: immediately flush any debounced text and persist immediately
			if (debounceTimer) {
				clearTimeout(debounceTimer);
				debounceTimer = null;
			}
			pendingItemsToPersist = null;
			if (pendingDebouncedResolver) {
				const resolver = pendingDebouncedResolver;
				pendingDebouncedResolver = null;
				pendingDebouncedPromise = null;
				resolver();
			}
			previousItems = currentItems;
			await persistItemsImmediately(currentItems);
		} else {
			// Text/content or title change: debounce persist
			previousItems = currentItems;
			persistUpdatedItemsDebounced(currentItems);
		}
	});

	const stop = (): void => {
		unsubscribe();
		if (debounceTimer) {
			clearTimeout(debounceTimer);
			debounceTimer = null;
		}
		pendingItemsToPersist = null;
		if (pendingDebouncedResolver) {
			const resolver = pendingDebouncedResolver;
			pendingDebouncedResolver = null;
			pendingDebouncedPromise = null;
			resolver();
		}
	};

	return {
		stop,
		flush,
	};
}
