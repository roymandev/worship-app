import { afterEach, beforeEach, describe, expect, it, vi } from "bun:test";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
		usePlaylistStore.setState({ editingItemId: "item-1" });
		render(<PlaylistItemEditor />);

		const titleInput = screen.getByLabelText("Title");
		const contentInput = screen.getByLabelText("Content");

		expect(titleInput).toBeInTheDocument();
		expect(titleInput).toHaveValue("Amazing Grace");
		expect(contentInput).toBeInTheDocument();
		expect(contentInput).toHaveValue(INITIAL_PLAYLIST_ITEMS[0].content);
	});

	it("autofocuses title input on mount", () => {
		usePlaylistStore.setState({ editingItemId: "item-1" });
		render(<PlaylistItemEditor />);

		const titleInput = screen.getByLabelText("Title");
		expect(document.activeElement).toBe(titleInput);
	});

	it("validates title: shows validation error when title is empty or whitespace-only and prevents saving", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({ editingItemId: "item-1" });
		render(<PlaylistItemEditor />);

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
		usePlaylistStore.setState({ editingItemId: "item-1" });
		render(<PlaylistItemEditor />);

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
		usePlaylistStore.setState({ editingItemId: "item-1" });
		render(<PlaylistItemEditor />);

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
		usePlaylistStore.setState({ editingItemId: "item-1" });
		render(<PlaylistItemEditor />);

		const cancelButton = screen.getByRole("button", { name: "Cancel" });
		await user.click(cancelButton);

		expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
		expect(usePlaylistStore.getState().editingItemId).toBeNull();
	});

	it("cancels cleanly without prompt when draft is unmodified on pressing Escape", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({ editingItemId: "item-1" });
		render(<PlaylistItemEditor />);

		await user.keyboard("{Escape}");

		expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
		expect(usePlaylistStore.getState().editingItemId).toBeNull();
	});

	it("displays AlertDialog confirmation when draft is dirty on clicking Cancel", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({ editingItemId: "item-1" });
		render(<PlaylistItemEditor />);

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
		usePlaylistStore.setState({ editingItemId: "item-1" });
		render(<PlaylistItemEditor />);

		const contentInput = screen.getByLabelText("Content");
		await user.type(contentInput, " modified content");

		await user.keyboard("{Escape}");

		const dialog = await screen.findByRole("alertdialog");
		expect(dialog).toBeInTheDocument();
		expect(screen.getByText("Discard unsaved changes?")).toBeInTheDocument();
	});

	it("canceling the alert dialog keeps the editor open with dirty draft intact and restores focus", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({ editingItemId: "item-1" });
		render(<PlaylistItemEditor />);

		const contentInput = screen.getByLabelText("Content");
		await user.click(contentInput);
		await user.type(contentInput, " modified");

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

		await waitFor(() => {
			expect(document.activeElement).toBe(contentInput);
		});
		expect(usePlaylistStore.getState().editingItemId).toBe("item-1");
	});

	it("pressing Escape while the discard confirmation dialog is open closes the dialog and keeps the draft", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({ editingItemId: "item-1" });
		render(<PlaylistItemEditor />);

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
		usePlaylistStore.setState({ editingItemId: "item-1" });
		render(<PlaylistItemEditor />);

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
		usePlaylistStore.setState({ editingItemId: "item-1" });
		const row = document.createElement("div");
		row.setAttribute("role", "row");
		row.setAttribute("data-item-id", "item-1");
		row.setAttribute("tabindex", "0");
		document.body.appendChild(row);

		const { unmount } = render(<PlaylistItemEditor />);

		expect(document.activeElement).toBe(screen.getByLabelText("Title"));

		unmount();

		expect(document.activeElement).toBe(row);
		document.body.removeChild(row);
	});

	it("restores focus to the caller element on unmount as fallback", async () => {
		usePlaylistStore.setState({ editingItemId: "item-1" });
		const triggerButton = document.createElement("button");
		triggerButton.textContent = "Trigger Edit";
		document.body.appendChild(triggerButton);
		triggerButton.focus();
		expect(document.activeElement).toBe(triggerButton);

		const { unmount } = render(<PlaylistItemEditor />);

		// Active element should be title input
		expect(document.activeElement).toBe(screen.getByLabelText("Title"));

		unmount();

		expect(document.activeElement).toBe(triggerButton);
		document.body.removeChild(triggerButton);
	});

	it("synchronously snapshots / resets form when itemId changes in store", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({ editingItemId: "item-1" });
		function Wrapper() {
			return (
				<div>
					<button
						type="button"
						onClick={() =>
							usePlaylistStore.setState({ editingItemId: "item-2" })
						}
					>
						Switch to item 2
					</button>
					<PlaylistItemEditor />
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
		usePlaylistStore.setState({ editingItemId: "non-existent" });
		render(<PlaylistItemEditor />);

		expect(usePlaylistStore.getState().editingItemId).toBeNull();
	});

	describe("beforeunload guard", () => {
		it("registers beforeunload listener when form is dirty and unregisters when cleaned", async () => {
			const addSpy = vi.spyOn(window, "addEventListener");
			const removeSpy = vi.spyOn(window, "removeEventListener");

			usePlaylistStore.setState({ editingItemId: "item-1" });
			render(<PlaylistItemEditor />);

			const user = userEvent.setup();
			const titleInput = screen.getByLabelText("Title");

			// Initial state: not dirty, no beforeunload listener
			const beforeunloadAddCalls = addSpy.mock.calls.filter(
				([event]) => event === "beforeunload",
			);
			expect(beforeunloadAddCalls.length).toBe(0);

			// Type to make dirty
			await user.type(titleInput, " modified");

			// Now beforeunload listener should be registered
			const dirtyAddCalls = addSpy.mock.calls.filter(
				([event]) => event === "beforeunload",
			);
			expect(dirtyAddCalls.length).toBeGreaterThan(0);

			// Test the event handler itself prevents default and sets returnValue
			const handler = dirtyAddCalls[dirtyAddCalls.length - 1][1] as (
				e: BeforeUnloadEvent,
			) => void;
			const mockEvent = {
				preventDefault: vi.fn(),
				returnValue: "not empty",
			} as unknown as BeforeUnloadEvent;

			handler(mockEvent);
			expect(mockEvent.preventDefault).toHaveBeenCalled();
			expect(mockEvent.returnValue).toBe("");

			// Clear text back to initial value to clean the form
			await user.clear(titleInput);
			await user.type(titleInput, "Amazing Grace");

			await waitFor(() => {
				const removeCalls = removeSpy.mock.calls.filter(
					([event]) => event === "beforeunload",
				);
				expect(removeCalls.length).toBeGreaterThan(0);
			});

			addSpy.mockRestore();
			removeSpy.mockRestore();
		});

		it("unregisters beforeunload listener when saved via Save button", async () => {
			const addSpy = vi.spyOn(window, "addEventListener");
			const removeSpy = vi.spyOn(window, "removeEventListener");

			usePlaylistStore.setState({ editingItemId: "item-1" });
			render(<PlaylistItemEditor />);

			const user = userEvent.setup();
			const titleInput = screen.getByLabelText("Title");
			await user.type(titleInput, " updated");

			expect(
				addSpy.mock.calls.some(([event]) => event === "beforeunload"),
			).toBe(true);

			const saveButton = screen.getByRole("button", { name: "Save" });
			await user.click(saveButton);

			await waitFor(() => {
				expect(
					removeSpy.mock.calls.some(([event]) => event === "beforeunload"),
				).toBe(true);
			});

			addSpy.mockRestore();
			removeSpy.mockRestore();
		});

		it("unregisters beforeunload listener when unmounted while dirty", async () => {
			const removeSpy = vi.spyOn(window, "removeEventListener");

			usePlaylistStore.setState({ editingItemId: "item-1" });
			const { unmount } = render(<PlaylistItemEditor />);

			const user = userEvent.setup();
			const titleInput = screen.getByLabelText("Title");
			await user.type(titleInput, " dirty change");

			unmount();

			const removeCalls = removeSpy.mock.calls.filter(
				([event]) => event === "beforeunload",
			);
			expect(removeCalls.length).toBeGreaterThan(0);

			removeSpy.mockRestore();
		});
	});

	describe("in-app item switch guard", () => {
		it("intercepts store editingItemId switch when dirty and opens discard dialog", async () => {
			const user = userEvent.setup();
			usePlaylistStore.setState({ editingItemId: "item-1" });
			render(<PlaylistItemEditor />);

			const titleInput = screen.getByLabelText("Title");
			await user.type(titleInput, " modified draft");

			// External switch attempted: switch to item-2
			act(() => {
				usePlaylistStore.getState().startEditingItem("item-2");
			});

			// Confirmation dialog should appear
			const dialog = await screen.findByRole("alertdialog");
			expect(dialog).toBeInTheDocument();
			expect(screen.getByText("Discard unsaved changes?")).toBeInTheDocument();

			// Input should still show current dirty draft
			expect(titleInput).toHaveValue("Amazing Grace modified draft");
		});

		it("canceling discard dialog on item switch reverts store editingItemId and preserves draft", async () => {
			const user = userEvent.setup();
			usePlaylistStore.setState({ editingItemId: "item-1" });
			render(<PlaylistItemEditor />);

			const titleInput = screen.getByLabelText("Title");
			await user.type(titleInput, " modified draft");

			// External switch to item-2
			act(() => {
				usePlaylistStore.getState().startEditingItem("item-2");
			});

			const dialog = await screen.findByRole("alertdialog");
			expect(dialog).toBeInTheDocument();

			// Click Cancel in dialog
			const dialogCancelButton = screen.getByRole("button", { name: "Cancel" });
			await user.click(dialogCancelButton);

			await waitFor(() => {
				expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
			});

			// Reverted back to item-1 in store and draft preserved
			expect(usePlaylistStore.getState().editingItemId).toBe("item-1");
			expect(titleInput).toHaveValue("Amazing Grace modified draft");
		});

		it("confirming discard on item switch advances to the new item", async () => {
			const user = userEvent.setup();
			usePlaylistStore.setState({ editingItemId: "item-1" });
			render(<PlaylistItemEditor />);

			const titleInput = screen.getByLabelText("Title");
			await user.type(titleInput, " modified draft");

			// External switch to item-2
			act(() => {
				usePlaylistStore.getState().startEditingItem("item-2");
			});

			const dialog = await screen.findByRole("alertdialog");
			expect(dialog).toBeInTheDocument();

			// Click Discard
			const discardButton = screen.getByRole("button", { name: "Discard" });
			await user.click(discardButton);

			await waitFor(() => {
				expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
				expect(usePlaylistStore.getState().editingItemId).toBe("item-2");
				expect(screen.getByLabelText("Title")).toHaveValue("Psalm 23");
			});
		});

		it("confirming discard on stopping edit (external set to null) stops editing", async () => {
			const user = userEvent.setup();
			usePlaylistStore.setState({ editingItemId: "item-1" });
			render(<PlaylistItemEditor />);

			const titleInput = screen.getByLabelText("Title");
			await user.type(titleInput, " modified draft");

			// External deselect/stop editing
			act(() => {
				usePlaylistStore.getState().stopEditingItem();
			});

			const dialog = await screen.findByRole("alertdialog");
			expect(dialog).toBeInTheDocument();

			// Click Discard
			const discardButton = screen.getByRole("button", { name: "Discard" });
			await user.click(discardButton);

			await waitFor(() => {
				expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
				expect(usePlaylistStore.getState().editingItemId).toBeNull();
			});
		});
	});
});
