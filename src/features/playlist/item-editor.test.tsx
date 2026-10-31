import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import {
	PlaylistItemEditor,
	playlistItemFormDefaultValues,
	playlistItemFormSchema,
} from "./item-editor";
import { INITIAL_PLAYLIST_ITEMS, usePlaylistStore } from "./store";

describe("PlaylistItemEditor", () => {
	beforeEach(() => {
		usePlaylistStore.setState({
			items: [...INITIAL_PLAYLIST_ITEMS],
			selectedItemId: "item-1",
			editingItemId: "item-1",
			mode: "view",
			activeConfirmDeleteId: null,
		});
	});

	afterEach(() => {
		cleanup();
	});

	it("exports schema, types, and default values matching conventions", () => {
		expect(playlistItemFormDefaultValues).toEqual({
			title: "",
			content: "",
		});

		const valid = playlistItemFormSchema.safeParse({
			title: "  Valid Title  ",
			content: "Some content",
		});
		expect(valid.success).toBe(true);
		if (valid.success) {
			expect(valid.data.title).toBe("Valid Title");
			expect(valid.data.content).toBe("Some content");
		}

		const invalid = playlistItemFormSchema.safeParse({
			title: "   ",
			content: "",
		});
		expect(invalid.success).toBe(false);
	});

	it("renders item title and content fields populated with store item values", () => {
		render(<PlaylistItemEditor itemId="item-1" />);

		const titleInput = screen.getByLabelText("Title");
		const contentInput = screen.getByLabelText("Content");

		expect(titleInput).toBeInTheDocument();
		expect(titleInput).toHaveValue("Amazing Grace");
		expect(contentInput).toBeInTheDocument();
		expect(contentInput).toHaveValue(INITIAL_PLAYLIST_ITEMS[0].content);
	});

	it("autofocuses title input on mount", () => {
		render(<PlaylistItemEditor itemId="item-1" />);

		const titleInput = screen.getByLabelText("Title");
		expect(document.activeElement).toBe(titleInput);
	});

	it("validates title: shows validation error when title is empty or whitespace-only and prevents saving", async () => {
		const user = userEvent.setup();
		render(<PlaylistItemEditor itemId="item-1" />);

		const titleInput = screen.getByLabelText("Title");
		await user.clear(titleInput);
		await user.type(titleInput, "   ");

		const saveButton = screen.getByRole("button", { name: "Save" });
		await user.click(saveButton);

		expect(await screen.findByRole("alert")).toHaveTextContent(
			"Title is required",
		);

		// Store should not be updated
		const storeItem = usePlaylistStore
			.getState()
			.items.find((i) => i.id === "item-1");
		expect(storeItem?.title).toBe("Amazing Grace");
		expect(usePlaylistStore.getState().editingItemId).toBe("item-1");
	});

	it("saves on clicking Save button, updating store and calling stopEditingItem", async () => {
		const user = userEvent.setup();
		render(<PlaylistItemEditor itemId="item-1" />);

		const titleInput = screen.getByLabelText("Title");
		const contentInput = screen.getByLabelText("Content");

		await user.clear(titleInput);
		await user.type(titleInput, "Amazing Grace (Updated)");
		await user.clear(contentInput);
		await user.type(contentInput, "New verse content");

		const saveButton = screen.getByRole("button", { name: "Save" });
		await user.click(saveButton);

		await waitFor(() => {
			const storeItem = usePlaylistStore
				.getState()
				.items.find((i) => i.id === "item-1");
			expect(storeItem?.title).toBe("Amazing Grace (Updated)");
			expect(storeItem?.content).toBe("New verse content");
			expect(usePlaylistStore.getState().editingItemId).toBeNull();
		});
	});

	it("saves on pressing Mod+Enter (Ctrl/Cmd+Enter), updating store and calling stopEditingItem", async () => {
		const user = userEvent.setup();
		render(<PlaylistItemEditor itemId="item-1" />);

		const titleInput = screen.getByLabelText("Title");
		await user.type(titleInput, " (Special)");

		// Mod+Enter
		await user.keyboard("{Meta>}{Enter}{/Meta}");

		await waitFor(() => {
			const storeItem = usePlaylistStore
				.getState()
				.items.find((i) => i.id === "item-1");
			expect(storeItem?.title).toBe("Amazing Grace (Special)");
			expect(usePlaylistStore.getState().editingItemId).toBeNull();
		});
	});

	it("cancels cleanly without prompt when draft is unmodified (isDirty === false) on clicking Cancel", async () => {
		const user = userEvent.setup();
		render(<PlaylistItemEditor itemId="item-1" />);

		const cancelButton = screen.getByRole("button", { name: "Cancel" });
		await user.click(cancelButton);

		expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
		expect(usePlaylistStore.getState().editingItemId).toBeNull();
	});

	it("cancels cleanly without prompt when draft is unmodified on pressing Escape", async () => {
		const user = userEvent.setup();
		render(<PlaylistItemEditor itemId="item-1" />);

		await user.keyboard("{Escape}");

		expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
		expect(usePlaylistStore.getState().editingItemId).toBeNull();
	});

	it("displays AlertDialog confirmation when draft is dirty on clicking Cancel", async () => {
		const user = userEvent.setup();
		render(<PlaylistItemEditor itemId="item-1" />);

		const titleInput = screen.getByLabelText("Title");
		await user.type(titleInput, " modified");

		const cancelButton = screen.getByRole("button", { name: "Cancel" });
		await user.click(cancelButton);

		const dialog = await screen.findByRole("alertdialog");
		expect(dialog).toBeInTheDocument();
		expect(screen.getByText("Discard unsaved changes?")).toBeInTheDocument();
		expect(
			screen.getByText("Unsaved edits to this playlist item will be lost."),
		).toBeInTheDocument();

		// Editing should not have stopped yet
		expect(usePlaylistStore.getState().editingItemId).toBe("item-1");
	});

	it("displays AlertDialog confirmation when draft is dirty on pressing Escape", async () => {
		const user = userEvent.setup();
		render(<PlaylistItemEditor itemId="item-1" />);

		const contentInput = screen.getByLabelText("Content");
		await user.type(contentInput, " modified content");

		await user.keyboard("{Escape}");

		const dialog = await screen.findByRole("alertdialog");
		expect(dialog).toBeInTheDocument();
		expect(screen.getByText("Discard unsaved changes?")).toBeInTheDocument();
	});

	it("canceling the alert dialog keeps the editor open with dirty draft intact", async () => {
		const user = userEvent.setup();
		render(<PlaylistItemEditor itemId="item-1" />);

		const titleInput = screen.getByLabelText("Title");
		await user.type(titleInput, " modified");

		const cancelButton = screen.getByRole("button", { name: "Cancel" });
		await user.click(cancelButton);

		const dialog = await screen.findByRole("alertdialog");
		expect(dialog).toBeInTheDocument();

		// Click the Cancel button inside the alertdialog
		const dialogCancelButton = screen.getByRole("button", { name: "Cancel" });
		await user.click(dialogCancelButton);

		await waitFor(() => {
			expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
		});

		expect(titleInput).toHaveValue("Amazing Grace modified");
		expect(usePlaylistStore.getState().editingItemId).toBe("item-1");
	});

	it("pressing Escape while the discard confirmation dialog is open closes the dialog and keeps the draft", async () => {
		const user = userEvent.setup();
		render(<PlaylistItemEditor itemId="item-1" />);

		const titleInput = screen.getByLabelText("Title");
		await user.type(titleInput, " modified draft");

		const cancelButton = screen.getByRole("button", { name: "Cancel" });
		await user.click(cancelButton);

		const dialog = await screen.findByRole("alertdialog");
		expect(dialog).toBeInTheDocument();

		// Press Escape on the open dialog
		await user.keyboard("{Escape}");

		await waitFor(() => {
			expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
		});

		expect(titleInput).toHaveValue("Amazing Grace modified draft");
		expect(usePlaylistStore.getState().editingItemId).toBe("item-1");
	});

	it("confirming discard closes the dialog, discards changes, and stops editing", async () => {
		const user = userEvent.setup();
		render(<PlaylistItemEditor itemId="item-1" />);

		const titleInput = screen.getByLabelText("Title");
		await user.type(titleInput, " modified");

		const cancelButton = screen.getByRole("button", { name: "Cancel" });
		await user.click(cancelButton);

		const discardButton = await screen.findByRole("button", {
			name: "Discard",
		});
		await user.click(discardButton);

		await waitFor(() => {
			expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
			expect(usePlaylistStore.getState().editingItemId).toBeNull();
		});

		// Store item was not modified
		const storeItem = usePlaylistStore
			.getState()
			.items.find((i) => i.id === "item-1");
		expect(storeItem?.title).toBe("Amazing Grace");
	});

	it("restores focus to playlist row when itemId matches in playlist grid on unmount", async () => {
		const row = document.createElement("div");
		row.setAttribute("role", "row");
		row.setAttribute("data-item-id", "item-1");
		row.setAttribute("tabindex", "0");
		document.body.appendChild(row);

		const { unmount } = render(<PlaylistItemEditor itemId="item-1" />);

		expect(document.activeElement).toBe(screen.getByLabelText("Title"));

		unmount();

		expect(document.activeElement).toBe(row);
		document.body.removeChild(row);
	});

	it("restores focus to the caller element on unmount as fallback", async () => {
		const triggerButton = document.createElement("button");
		triggerButton.textContent = "Trigger Edit";
		document.body.appendChild(triggerButton);
		triggerButton.focus();
		expect(document.activeElement).toBe(triggerButton);

		const { unmount } = render(<PlaylistItemEditor itemId="item-1" />);

		// Active element should be title input
		expect(document.activeElement).toBe(screen.getByLabelText("Title"));

		unmount();

		expect(document.activeElement).toBe(triggerButton);
		document.body.removeChild(triggerButton);
	});

	it("synchronously snapshots / resets form when itemId prop changes", async () => {
		const user = userEvent.setup();
		function Wrapper() {
			const [id, setId] = useState("item-1");
			return (
				<div>
					<button type="button" onClick={() => setId("item-2")}>
						Switch to item 2
					</button>
					<PlaylistItemEditor itemId={id} />
				</div>
			);
		}

		render(<Wrapper />);

		const titleInput = screen.getByLabelText("Title");
		expect(titleInput).toHaveValue("Amazing Grace");

		await user.click(screen.getByRole("button", { name: "Switch to item 2" }));

		await waitFor(() => {
			expect(titleInput).toHaveValue("Psalm 23");
		});
	});

	it("handles missing item gracefully by calling stopEditingItem", () => {
		render(<PlaylistItemEditor itemId="non-existent" />);

		expect(usePlaylistStore.getState().editingItemId).toBeNull();
	});
});
