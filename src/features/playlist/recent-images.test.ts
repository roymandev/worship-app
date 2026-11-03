import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { WorshipDatabase } from "../../db/database";
import {
	addRecentBackgroundImage,
	getRecentBackgroundImages,
	METADATA_KEY_RECENT_BACKGROUND_IMAGES,
	removeRecentBackgroundImage,
} from "./recent-images";

describe("recent-images storage helpers", () => {
	let testDb: WorshipDatabase;

	beforeEach(async () => {
		testDb = new WorshipDatabase("TestRecentImagesDatabase");
		await testDb.delete();
		await testDb.open();
	});

	afterEach(async () => {
		if (testDb.isOpen()) {
			await testDb.close();
		}
	});

	it("initializes and returns an empty array when no recent images exist", async () => {
		const result = await getRecentBackgroundImages(testDb);
		expect(result).toEqual([]);
	});

	it("adds a new recent background image", async () => {
		const url = "https://images.unsplash.com/photo-1";
		const updated = await addRecentBackgroundImage(url, testDb);

		expect(updated).toHaveLength(1);
		expect(updated[0].url).toBe(url);
		expect(typeof updated[0].id).toBe("string");
		expect(typeof updated[0].addedAt).toBe("number");

		const fetched = await getRecentBackgroundImages(testDb);
		expect(fetched).toEqual(updated);
	});

	it("caps recent background images at 8 items", async () => {
		for (let i = 1; i <= 10; i++) {
			await addRecentBackgroundImage(
				`https://images.unsplash.com/photo-${i}`,
				testDb,
			);
		}

		const images = await getRecentBackgroundImages(testDb);
		expect(images).toHaveLength(8);
		// Most recent item should be photo-10 at index 0, followed by 9, 8, ... down to 3
		expect(images[0].url).toBe("https://images.unsplash.com/photo-10");
		expect(images[7].url).toBe("https://images.unsplash.com/photo-3");
	});

	it("deduplicates by URL and brings matched URL to the front with latest addedAt", async () => {
		await addRecentBackgroundImage(
			"https://images.unsplash.com/photo-1",
			testDb,
		);
		await new Promise((resolve) => setTimeout(resolve, 10));
		await addRecentBackgroundImage(
			"https://images.unsplash.com/photo-2",
			testDb,
		);
		await new Promise((resolve) => setTimeout(resolve, 10));
		await addRecentBackgroundImage(
			"https://images.unsplash.com/photo-3",
			testDb,
		);

		const beforeImages = await getRecentBackgroundImages(testDb);
		expect(beforeImages.map((img) => img.url)).toEqual([
			"https://images.unsplash.com/photo-3",
			"https://images.unsplash.com/photo-2",
			"https://images.unsplash.com/photo-1",
		]);

		const photo1Id = beforeImages[2].id;
		const photo1InitialAddedAt = beforeImages[2].addedAt;

		await new Promise((resolve) => setTimeout(resolve, 10));
		const updated = await addRecentBackgroundImage(
			"https://images.unsplash.com/photo-1",
			testDb,
		);

		expect(updated.map((img) => img.url)).toEqual([
			"https://images.unsplash.com/photo-1",
			"https://images.unsplash.com/photo-3",
			"https://images.unsplash.com/photo-2",
		]);
		expect(updated[0].id).toBe(photo1Id);
		expect(updated[0].addedAt).toBeGreaterThan(photo1InitialAddedAt);
	});

	it("removes a recent background image by ID", async () => {
		const img1 = await addRecentBackgroundImage(
			"https://images.unsplash.com/photo-1",
			testDb,
		);
		const img2 = await addRecentBackgroundImage(
			"https://images.unsplash.com/photo-2",
			testDb,
		);

		expect(img2).toHaveLength(2);
		const targetId = img1[0].id;

		const afterRemoval = await removeRecentBackgroundImage(targetId, testDb);
		expect(afterRemoval).toHaveLength(1);
		expect(afterRemoval[0].url).toBe("https://images.unsplash.com/photo-2");

		const fetched = await getRecentBackgroundImages(testDb);
		expect(fetched).toEqual(afterRemoval);
	});

	it("handles corrupted or non-array metadata gracefully", async () => {
		await testDb.metadata.put({
			key: METADATA_KEY_RECENT_BACKGROUND_IMAGES,
			value: "invalid-payload",
		});

		const images = await getRecentBackgroundImages(testDb);
		expect(images).toEqual([]);
	});
});
