import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { db, resetDatabase } from "@/db";
import { usePlaylistStore } from "@/features/playlist/store";
import { usePlaylistPersistenceInit } from "@/features/playlist/use-persistence-init";

function TestPersistenceComponent() {
	usePlaylistPersistenceInit();
	const hydrationStatus = usePlaylistStore((s) => s.hydrationStatus);
	const itemsCount = usePlaylistStore((s) => s.items.length);

	return (
		<div>
			<span data-testid="status">{hydrationStatus}</span>
			<span data-testid="count">{itemsCount}</span>
		</div>
	);
}

describe("usePlaylistPersistenceInit Integration", () => {
	beforeEach(async () => {
		await resetDatabase({ seed: false });
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
		cleanup();
		delete window.__db;
		await resetDatabase({ seed: false });
	});

	it("initializes database, hydrates initial seed data, and sets status to ready", async () => {
		render(<TestPersistenceComponent />);

		expect(screen.getByTestId("status").textContent).toMatch(
			/idle|hydrating|ready/,
		);

		await waitFor(() => {
			expect(screen.getByTestId("status")).toHaveTextContent("ready");
		});

		expect(screen.getByTestId("count")).toHaveTextContent("3");
	});

	it("exposes window.__db in development mode", async () => {
		render(<TestPersistenceComponent />);

		await waitFor(() => {
			expect(screen.getByTestId("status")).toHaveTextContent("ready");
		});

		if (import.meta.env.DEV) {
			expect(window.__db).toBeDefined();
			expect(window.__db?.db).toBe(db);
			expect(typeof window.__db?.resetDatabase).toBe("function");
			expect(typeof window.__db?.seedDemoData).toBe("function");
		}
	});

	it("persists playlist modifications to IndexedDB", async () => {
		render(<TestPersistenceComponent />);

		await waitFor(() => {
			expect(screen.getByTestId("status")).toHaveTextContent("ready");
		});

		usePlaylistStore.getState().addItem("Persisted Song", "Verse 1\nLyrics");

		await waitFor(async () => {
			const count = await db.playlistItems.count();
			expect(count).toBe(4);
		});

		const items = await db.playlistItems.orderBy("position").toArray();
		expect(items[3].title).toBe("Persisted Song");
	});
});
