import { useEffect } from "react";
import { db, resetDatabase, seedDemoData } from "@/db";
import { createPlaylistPersistenceCoordinator } from "./persistence";
import { usePlaylistStore } from "./store";

export function usePlaylistPersistenceInit() {
	useEffect(() => {
		if (import.meta.env.DEV && typeof window !== "undefined") {
			window.__db = {
				db,
				resetDatabase,
				seedDemoData,
			};
		}

		const coordinator = createPlaylistPersistenceCoordinator(
			usePlaylistStore,
			db,
			{ debounceMs: 500 },
		);

		void coordinator.init().catch((error) => {
			console.error("Failed to initialize playlist persistence:", error);
		});

		return () => {
			coordinator.destroy();
		};
	}, []);
}
