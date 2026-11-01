import Dexie, { type EntityTable } from "dexie";
import type { PlaylistItem } from "../features/playlist/store";
import { resetDatabase } from "./seed";

export interface PlaylistItemRecord extends PlaylistItem {
	position: number;
}

export interface AppMetadataRecord {
	key: string;
	value: unknown;
}

export class WorshipDatabase extends Dexie {
	playlistItems!: EntityTable<PlaylistItemRecord, "id">;
	metadata!: EntityTable<AppMetadataRecord, "key">;

	constructor(databaseName = "WorshipDatabase") {
		super(databaseName);

		this.version(1).stores({
			playlistItems: "id, position",
			metadata: "key",
		});

		this.on("versionchange", () => {
			this.close();
		});
	}
}

export const db = new WorshipDatabase();

export async function initDatabase(
	database: WorshipDatabase = db,
): Promise<WorshipDatabase> {
	try {
		await database.open();
	} catch (error) {
		const isSchemaOrVersionError =
			error instanceof Dexie.SchemaError ||
			error instanceof Dexie.VersionError ||
			(error instanceof Dexie.DexieError &&
				(error.name === "SchemaError" || error.name === "VersionError"));

		if (import.meta.env?.DEV && isSchemaOrVersionError) {
			console.warn(
				"Database schema mismatch in development mode. Purging and resetting database...",
				error,
			);
			await resetDatabase({ seed: true }, database);
			return database;
		}
		throw error;
	}

	return database;
}
