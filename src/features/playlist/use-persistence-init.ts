import { useEffect } from "react";
import {
	db,
	hydratePlaylistStore,
	initDatabase,
	resetDatabase,
	seedDemoData,
	startPlaylistPersistence,
} from "@/db";

export function usePlaylistPersistenceInit() {
	useEffect(() => {
		let isCancelled = false;
		let stopPersistence: (() => void) | null = null;

		if (import.meta.env.DEV && typeof window !== "undefined") {
			window.__db = {
				db,
				resetDatabase,
				seedDemoData,
			};
		}

		async function init() {
			try {
				await initDatabase();
				if (isCancelled) return;

				await hydratePlaylistStore();
				if (isCancelled) return;

				const syncManager = startPlaylistPersistence();
				stopPersistence = syncManager.stop;
			} catch (error) {
				console.error("Failed to initialize playlist persistence:", error);
			}
		}

		void init();

		return () => {
			isCancelled = true;
			if (stopPersistence) {
				stopPersistence();
			}
		};
	}, []);
}
