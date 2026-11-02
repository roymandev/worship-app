import {
	db,
	hydratePlaylistStore,
	initDatabase,
	type PersistenceSyncManager,
	startPlaylistPersistence,
	type WorshipDatabase,
} from "@/db";
import { type PlaylistStore, usePlaylistStore } from "./store";

export interface PlaylistPersistenceCoordinatorOptions {
	debounceMs?: number;
}

export class PlaylistPersistenceCoordinator {
	private readonly store: PlaylistStore;
	private readonly db: WorshipDatabase;
	private readonly debounceMs: number;
	private syncManager: PersistenceSyncManager | null = null;
	private isInitialized = false;
	private isDestroyed = false;

	constructor(
		store: PlaylistStore = usePlaylistStore,
		database: WorshipDatabase = db,
		options: PlaylistPersistenceCoordinatorOptions = {},
	) {
		this.store = store;
		this.db = database;
		this.debounceMs = options.debounceMs ?? 500;
	}

	private handleBeforeUnload = (): void => {
		void this.flush();
	};

	async init(): Promise<void> {
		if (this.isInitialized || this.isDestroyed) {
			return;
		}

		await initDatabase(this.db);
		if (this.isDestroyed) {
			return;
		}

		await hydratePlaylistStore(this.db, this.store);
		if (this.isDestroyed) {
			return;
		}

		this.syncManager = startPlaylistPersistence(
			this.db,
			this.store,
			this.debounceMs,
		);

		if (typeof window !== "undefined") {
			window.addEventListener("beforeunload", this.handleBeforeUnload);
		}

		this.isInitialized = true;
	}

	async flush(): Promise<void> {
		if (this.syncManager) {
			await this.syncManager.flush();
		}
	}

	destroy(): void {
		if (this.isDestroyed) {
			return;
		}

		if (typeof window !== "undefined") {
			window.removeEventListener("beforeunload", this.handleBeforeUnload);
		}

		if (this.syncManager) {
			const manager = this.syncManager;
			this.syncManager = null;
			void manager.flush().finally(() => {
				manager.stop();
			});
		}

		this.isDestroyed = true;
	}
}

export function createPlaylistPersistenceCoordinator(
	store: PlaylistStore = usePlaylistStore,
	database: WorshipDatabase = db,
	options?: PlaylistPersistenceCoordinatorOptions,
): PlaylistPersistenceCoordinator {
	return new PlaylistPersistenceCoordinator(store, database, options);
}
