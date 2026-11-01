import { INITIAL_PLAYLIST_ITEMS } from "../features/playlist/store";
import { db, type PlaylistItemRecord, type WorshipDatabase } from "./database";

export async function seedDemoData(
	database: WorshipDatabase = db,
): Promise<void> {
	const records: PlaylistItemRecord[] = INITIAL_PLAYLIST_ITEMS.map(
		(item, index) => ({
			...item,
			position: index,
		}),
	);

	await database.transaction(
		"rw",
		[database.playlistItems, database.metadata],
		async () => {
			await database.playlistItems.clear();
			await database.playlistItems.bulkAdd(records);
			await database.metadata.put({
				key: "hasUserClearedPlaylist",
				value: false,
			});
		},
	);
}

export interface ResetDatabaseOptions {
	seed?: boolean;
}

export async function resetDatabase(
	options: ResetDatabaseOptions = { seed: true },
	database: WorshipDatabase = db,
): Promise<void> {
	await database.delete();
	await database.open();

	if (options.seed ?? true) {
		await seedDemoData(database);
	}
}
