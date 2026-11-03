import { db, type WorshipDatabase } from "../../db/database";

export interface RecentBackgroundImage {
	id: string;
	url: string;
	addedAt: number;
}

export const METADATA_KEY_RECENT_BACKGROUND_IMAGES = "recentBackgroundImages";

const MAX_RECENT_BACKGROUND_IMAGES = 8;

function parseRecentImages(raw: unknown): RecentBackgroundImage[] {
	if (!Array.isArray(raw)) {
		return [];
	}
	return raw.filter(
		(item): item is RecentBackgroundImage =>
			typeof item === "object" &&
			item !== null &&
			typeof item.id === "string" &&
			typeof item.url === "string" &&
			typeof item.addedAt === "number",
	);
}

export async function getRecentBackgroundImages(
	database: WorshipDatabase = db,
): Promise<RecentBackgroundImage[]> {
	const record = await database.metadata.get(
		METADATA_KEY_RECENT_BACKGROUND_IMAGES,
	);
	if (!record) {
		return [];
	}
	return parseRecentImages(record.value);
}

export async function addRecentBackgroundImage(
	url: string,
	database: WorshipDatabase = db,
): Promise<RecentBackgroundImage[]> {
	const current = await getRecentBackgroundImages(database);
	const existing = current.find((item) => item.url === url);

	const newItem: RecentBackgroundImage = {
		id: existing ? existing.id : crypto.randomUUID(),
		url,
		addedAt: Date.now(),
	};

	const filtered = current.filter((item) => item.url !== url);
	const updated = [newItem, ...filtered].slice(0, MAX_RECENT_BACKGROUND_IMAGES);

	await database.metadata.put({
		key: METADATA_KEY_RECENT_BACKGROUND_IMAGES,
		value: updated,
	});

	return updated;
}

export async function removeRecentBackgroundImage(
	id: string,
	database: WorshipDatabase = db,
): Promise<RecentBackgroundImage[]> {
	const current = await getRecentBackgroundImages(database);
	const updated = current.filter((item) => item.id !== id);

	await database.metadata.put({
		key: METADATA_KEY_RECENT_BACKGROUND_IMAGES,
		value: updated,
	});

	return updated;
}
