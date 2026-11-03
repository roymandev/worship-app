import { beforeEach, describe, expect, it } from "bun:test";
import { INITIAL_PLAYLIST_ITEMS } from "../features/playlist/store";
import { initDatabase, WorshipDatabase } from "./database";
import { resetDatabase, seedDemoData } from "./seed";

describe("WorshipDatabase", () => {
	let testDb: WorshipDatabase;

	beforeEach(async () => {
		testDb = new WorshipDatabase("TestWorshipDatabase");
		await testDb.delete();
		await testDb.open();
	});

	it("initializes with version 1 and defined tables", () => {
		expect(testDb.verno).toBe(1);
		expect(testDb.playlistItems).toBeDefined();
		expect(testDb.metadata).toBeDefined();
		expect(testDb.playlistItems.schema.primKey.name).toBe("id");
		const indexNames = testDb.playlistItems.schema.indexes.map(
			(idx) => idx.name,
		);
		expect(indexNames).toContain("position");
		expect(indexNames).not.toContain("content");
	});

	it("seeds demo data with sequential position indices", async () => {
		await seedDemoData(testDb);

		const items = await testDb.playlistItems.orderBy("position").toArray();
		expect(items.length).toBe(INITIAL_PLAYLIST_ITEMS.length);

		for (let i = 0; i < items.length; i++) {
			expect(items[i].id).toBe(INITIAL_PLAYLIST_ITEMS[i].id);
			expect(items[i].title).toBe(INITIAL_PLAYLIST_ITEMS[i].title);
			expect(items[i].content).toBe(INITIAL_PLAYLIST_ITEMS[i].content);
			expect(items[i].position).toBe(i);
		}

		const metadata = await testDb.metadata.get("hasUserClearedPlaylist");
		expect(metadata).toEqual({
			key: "hasUserClearedPlaylist",
			value: false,
		});
	});

	it("resets database with seeding enabled by default", async () => {
		await seedDemoData(testDb);
		await testDb.playlistItems.add({
			id: "custom-id",
			title: "Custom Song",
			content: "Custom Content",
			position: 99,
		});

		expect(await testDb.playlistItems.count()).toBe(
			INITIAL_PLAYLIST_ITEMS.length + 1,
		);

		await resetDatabase({ seed: true }, testDb);

		expect(await testDb.playlistItems.count()).toBe(
			INITIAL_PLAYLIST_ITEMS.length,
		);
		const customItem = await testDb.playlistItems.get("custom-id");
		expect(customItem).toBeUndefined();
	});

	it("resets database with empty tables when seed is false", async () => {
		await seedDemoData(testDb);
		expect(await testDb.playlistItems.count()).toBe(
			INITIAL_PLAYLIST_ITEMS.length,
		);

		await resetDatabase({ seed: false }, testDb);

		expect(await testDb.playlistItems.count()).toBe(0);
	});

	it("opens successfully via initDatabase", async () => {
		const initialized = await initDatabase(testDb);
		expect(initialized.isOpen()).toBe(true);
	});
});
