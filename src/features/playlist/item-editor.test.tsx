import { afterEach, beforeEach, describe, expect, it, vi } from "bun:test";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
	PlaylistItemEditor,
	playlistItemFormDefaultValues,
	playlistItemFormSchema,
} from "./item-editor";
import * as recentImagesModule from "./recent-images";
import {
	INITIAL_PLAYLIST_ITEMS,
	INITIAL_PLAYLIST_STATE,
	usePlaylistStore,
} from "./store";

describe("PlaylistItemEditor", () => {
	beforeEach(() => {
		usePlaylistStore.getState().clearEditorDraft();
		usePlaylistStore.setState({
			...INITIAL_PLAYLIST_STATE,
			selectedItemId: "item-1",
			editingItemId: "item-1",
		});
	});

	afterEach(() => {
		cleanup();
		usePlaylistStore.getState().clearEditorDraft();
	});

	it("exports schema, types, and default values matching conventions", () => {
		expect(playlistItemFormDefaultValues).toEqual({
			title: "",
			content: "",
			background: null,
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

	it("renders panel header with title, IconPencil, Cancel, and Save buttons, without bottom footer", () => {
		usePlaylistStore.setState({ editingItemId: "item-1" });
		render(<PlaylistItemEditor />);

		const form = screen.getByRole("form", { name: "Edit playlist item" });
		expect(form).toBeInTheDocument();

		expect(
			screen.getByRole("heading", { name: "Edit Playlist Item", level: 2 }),
		).toBeInTheDocument();

		const cancelButton = screen.getByRole("button", { name: "Cancel" });
		const saveButton = screen.getByRole("button", { name: "Save" });

		expect(cancelButton).toBeInTheDocument();
		expect(saveButton).toBeInTheDocument();

		// Assert no bottom footer exists
		expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
	});

	it("renders General and Background tabs with General active by default, and allows tab switching", async () => {
		const user = userEvent.setup();
		usePlaylistStore.setState({ editingItemId: "item-1" });
		render(<PlaylistItemEditor />);

		const tabList = screen.getByRole("tablist");
		expect(tabList).toBeInTheDocument();
		expect(tabList).toHaveAttribute("data-variant", "default");

		const generalTab = screen.getByRole("tab", { name: "General" });
		const backgroundTab = screen.getByRole("tab", { name: "Background" });

		expect(generalTab).toBeInTheDocument();
		expect(backgroundTab).toBeInTheDocument();
		expect(generalTab).toHaveAttribute("aria-selected", "true");
		expect(backgroundTab).toHaveAttribute("aria-selected", "false");

		// Inputs in General tab are visible
		expect(screen.getByLabelText("Title")).toBeInTheDocument();
		expect(screen.getByLabelText("Content")).toBeInTheDocument();

		// Tab panels have tabIndex={-1} to eliminate phantom focus stops
		const generalPanel = screen.getByRole("tabpanel", { name: "General" });
		expect(generalPanel).toHaveAttribute("tabindex", "-1");

		// Switch to Background tab
		await user.click(backgroundTab);

		expect(backgroundTab).toHaveAttribute("aria-selected", "true");
		expect(generalTab).toHaveAttribute("aria-selected", "false");

		const backgroundPanel = screen.getByRole("tabpanel", {
			name: "Background",
		});
		expect(backgroundPanel).toHaveAttribute("tabindex", "-1");

		// Assert in-editor 16:9 preview container is removed
		expect(
			screen.queryByText("No background image selected"),
		).not.toBeInTheDocument();
		expect(screen.queryByText("Preview")).not.toBeInTheDocument();

		// Unified layout: No sub-mode segmented toggle for Image or Solid Color
		expect(
			screen.queryByRole("button", { name: "Image" }),
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: "Solid Color" }),
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("group", { name: "Background mode" }),
		).not.toBeInTheDocument();

		// Unified layout fields are present in single view
		expect(screen.getByRole("button", { name: /Color:/i })).toBeInTheDocument();
		expect(screen.getByText("Image Gallery")).toBeInTheDocument();
		expect(screen.getByLabelText("Brightness")).toBeInTheDocument();

		// Switch back to General tab
		await user.click(generalTab);
		expect(generalTab).toHaveAttribute("aria-selected", "true");
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

	describe("live preview synchronisation", () => {
		it("initializes editor draft on mount with item content and caretOffset 0", () => {
			usePlaylistStore.setState({ editingItemId: "item-1" });
			render(<PlaylistItemEditor />);

			expect(usePlaylistStore.getState().editorDraft.draftContent).toBe(
				INITIAL_PLAYLIST_ITEMS[0].content,
			);
			expect(usePlaylistStore.getState().editorDraft.caretOffset).toBe(0);
		});

		it("updates editor draft when typing into the content textarea", async () => {
			const user = userEvent.setup();
			usePlaylistStore.setState({ editingItemId: "item-1" });
			render(<PlaylistItemEditor />);

			const contentTextarea = screen.getByLabelText("Content");
			await user.clear(contentTextarea);
			await user.type(contentTextarea, "Line 1\n\nLine 2");

			expect(usePlaylistStore.getState().editorDraft.draftContent).toBe(
				"Line 1\n\nLine 2",
			);
		});

		it("updates editor draft caretOffset on cursor movement and click", async () => {
			const user = userEvent.setup();
			usePlaylistStore.setState({ editingItemId: "item-1" });
			render(<PlaylistItemEditor />);

			const contentTextarea = screen.getByLabelText(
				"Content",
			) as HTMLTextAreaElement;
			await user.clear(contentTextarea);
			await user.type(contentTextarea, "Hello world");

			// Caret is at end (11) after typing
			expect(usePlaylistStore.getState().editorDraft.caretOffset).toBe(11);

			// Moving caret with keyboard ArrowLeft moves caret left
			await user.keyboard(
				"{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}",
			);
			expect(usePlaylistStore.getState().editorDraft.caretOffset).toBe(6);

			await user.keyboard("{Home}");
			expect(usePlaylistStore.getState().editorDraft.caretOffset).toBe(0);

			await user.keyboard("{End}");
			expect(usePlaylistStore.getState().editorDraft.caretOffset).toBe(11);

			// Clicking inside textarea triggers syncPreviewFromTextarea
			await user.click(contentTextarea);
			expect(typeof usePlaylistStore.getState().editorDraft.caretOffset).toBe(
				"number",
			);
		});

		it("clears editor draft on cancel, discard, and component unmount", async () => {
			const user = userEvent.setup();
			usePlaylistStore.setState({ editingItemId: "item-1" });
			const { unmount } = render(<PlaylistItemEditor />);

			expect(
				usePlaylistStore.getState().editorDraft.draftContent,
			).not.toBeNull();

			const cancelButton = screen.getByRole("button", { name: "Cancel" });
			await user.click(cancelButton);

			expect(usePlaylistStore.getState().editorDraft.draftContent).toBeNull();

			unmount();
			expect(usePlaylistStore.getState().editorDraft.draftContent).toBeNull();
		});

		it("clears editor draft when discarding dirty changes", async () => {
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

			expect(usePlaylistStore.getState().editorDraft.draftContent).toBeNull();
		});

		it("clears editor draft on save", async () => {
			const user = userEvent.setup();
			usePlaylistStore.setState({ editingItemId: "item-1" });
			render(<PlaylistItemEditor />);

			const saveButton = screen.getByRole("button", { name: "Save" });
			await user.click(saveButton);

			await waitFor(() => {
				expect(usePlaylistStore.getState().editorDraft.draftContent).toBeNull();
			});
		});

		it("commits content changes to usePlaylistStore on blur if form is valid", async () => {
			const user = userEvent.setup();
			usePlaylistStore.setState({ editingItemId: "item-1" });
			render(<PlaylistItemEditor />);

			const contentTextarea = screen.getByLabelText("Content");
			await user.clear(contentTextarea);
			await user.type(contentTextarea, "Committed on blur");

			const titleInput = screen.getByLabelText("Title");
			await user.click(titleInput);

			expect(
				usePlaylistStore.getState().items.find((i) => i.id === "item-1")
					?.content,
			).toBe("Committed on blur");
		});
	});

	describe("Background tab", () => {
		it("renders unified background controls when switching to Background tab", async () => {
			const user = userEvent.setup();
			usePlaylistStore.setState({ editingItemId: "item-1" });
			render(<PlaylistItemEditor />);

			const backgroundTab = screen.getByRole("tab", { name: "Background" });
			await user.click(backgroundTab);

			expect(
				screen.queryByText("No background image selected"),
			).not.toBeInTheDocument();
			expect(screen.queryByText("Preview")).not.toBeInTheDocument();
			// Sub-tabs / mode toggles are eliminated
			expect(
				screen.queryByRole("button", { name: "Image" }),
			).not.toBeInTheDocument();
			expect(
				screen.queryByRole("button", { name: "Solid Color" }),
			).not.toBeInTheDocument();
			expect(
				screen.queryByRole("group", { name: "Background mode" }),
			).not.toBeInTheDocument();

			// Status bar and remove button are removed completely
			expect(screen.queryByText("No background set")).not.toBeInTheDocument();
			expect(
				screen.queryByText("Default theme will be used"),
			).not.toBeInTheDocument();
			expect(screen.queryByText("Image Background")).not.toBeInTheDocument();
			expect(screen.queryByText("Color Background")).not.toBeInTheDocument();
			expect(
				screen.queryByRole("button", { name: "Clear background" }),
			).not.toBeInTheDocument();

			// Image gallery section is rendered at top
			expect(screen.getByText("Image Gallery")).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: "Add Image" }),
			).toBeInTheDocument();

			// Color picker trigger
			expect(
				screen.getByRole("button", { name: /Color:/i }),
			).toBeInTheDocument();

			// Brightness input field
			expect(screen.getByLabelText("Brightness")).toBeInTheDocument();
		});

		it("adding image via gallery popover direct URL updates background and submits", async () => {
			const user = userEvent.setup();
			usePlaylistStore.setState({ editingItemId: "item-1" });
			render(<PlaylistItemEditor />);

			await user.click(screen.getByRole("tab", { name: "Background" }));

			// Open Add Image popover
			await user.click(screen.getByRole("button", { name: "Add Image" }));

			const urlInput = screen.getByLabelText("Direct Image URL");
			await user.type(urlInput, "https://example.com/worship.jpg");
			const submitBtn = screen.getByRole("button", { name: /^add$/i });
			await user.click(submitBtn);

			// Save the form
			const saveButton = screen.getByRole("button", { name: "Save" });
			await user.click(saveButton);

			await waitFor(() => {
				const item = usePlaylistStore
					.getState()
					.items.find((i) => i.id === "item-1");
				expect(item?.background).toEqual({
					type: "image",
					url: "https://example.com/worship.jpg",
					brightness: 100,
					color: "#000000",
				});
			});
		});

		it("adjusting shared brightness input updates brightness and submits", async () => {
			const user = userEvent.setup();
			usePlaylistStore.setState({
				items: [
					{
						id: "item-1",
						title: "Amazing Grace",
						content: "lyrics",
						background: {
							type: "image",
							url: "https://example.com/worship.jpg",
							brightness: 100,
						},
					},
				],
				editingItemId: "item-1",
			});
			render(<PlaylistItemEditor />);

			await user.click(screen.getByRole("tab", { name: "Background" }));

			const brightnessInput = screen.getByLabelText("Brightness");
			expect(brightnessInput).toHaveValue(100);

			await user.clear(brightnessInput);
			await user.type(brightnessInput, "75");

			const saveButton = screen.getByRole("button", { name: "Save" });
			await user.click(saveButton);

			await waitFor(() => {
				const item = usePlaylistStore
					.getState()
					.items.find((i) => i.id === "item-1");
				expect(item?.background?.type).toBe("image");
				if (item?.background?.type === "image") {
					expect(item.background.brightness).toBe(75);
				}
			});
		});

		it("deselecting image from gallery falls back to color if color is configured", async () => {
			const user = userEvent.setup();
			usePlaylistStore.setState({
				items: [
					{
						id: "item-1",
						title: "Amazing Grace",
						content: "lyrics",
						background: {
							type: "image",
							url: "https://example.com/initial.jpg",
							brightness: 100,
						},
					},
				],
				editingItemId: "item-1",
			});
			render(<PlaylistItemEditor />);

			await user.click(screen.getByRole("tab", { name: "Background" }));

			// Pick a color first
			const trigger = screen.getByRole("button", { name: /Color:/i });
			await user.click(trigger);
			const burgundySwatch = screen.getByRole("button", { name: "Burgundy" });
			await user.click(burgundySwatch);

			// Deselect image via thumbnail click if in gallery, or select another then toggle off
			// Open Add Image popover and add initial.jpg so it's selected in gallery
			await user.click(screen.getByRole("button", { name: "Add Image" }));
			const urlInput = screen.getByLabelText("Direct Image URL");
			await user.type(urlInput, "https://example.com/initial.jpg");
			await user.click(screen.getByRole("button", { name: "Add" }));

			// Clicking the selected thumbnail deselects it
			const selectedThumb = screen.getByRole("radio", {
				name: /Select gallery image 1/i,
			});
			expect(selectedThumb).toHaveAttribute("aria-checked", "true");
			await user.click(selectedThumb);
			expect(selectedThumb).toHaveAttribute("aria-checked", "false");

			const saveButton = screen.getByRole("button", { name: "Save" });
			await user.click(saveButton);

			await waitFor(() => {
				const item = usePlaylistStore
					.getState()
					.items.find((i) => i.id === "item-1");
				expect(item?.background).toEqual({
					type: "color",
					color: "#450a0a",
					brightness: 100,
				});
			});
		});

		it("deselecting image from gallery leaves default color when color is unconfigured", async () => {
			const user = userEvent.setup();
			usePlaylistStore.setState({
				items: [
					{
						id: "item-1",
						title: "Amazing Grace",
						content: "lyrics",
						background: {
							type: "image",
							url: "https://example.com/initial.jpg",
							brightness: 100,
						},
					},
				],
				editingItemId: "item-1",
			});
			render(<PlaylistItemEditor />);

			await user.click(screen.getByRole("tab", { name: "Background" }));

			// Add image into gallery and deselect it
			await user.click(screen.getByRole("button", { name: "Add Image" }));
			const urlInput = screen.getByLabelText("Direct Image URL");
			await user.type(urlInput, "https://example.com/initial.jpg");
			await user.click(screen.getByRole("button", { name: "Add" }));

			const selectedThumb = screen.getByRole("radio", {
				name: /Select gallery image 1/i,
			});
			expect(selectedThumb).toHaveAttribute("aria-checked", "true");
			await user.click(selectedThumb);
			expect(selectedThumb).toHaveAttribute("aria-checked", "false");

			const saveButton = screen.getByRole("button", { name: "Save" });
			await user.click(saveButton);

			await waitFor(() => {
				const item = usePlaylistStore
					.getState()
					.items.find((i) => i.id === "item-1");
				expect(item?.background).toEqual({
					type: "color",
					color: "#000000",
					brightness: 100,
				});
			});
		});

		it("initializes draftColor from image background color and reverts to it on deselecting image", async () => {
			const user = userEvent.setup();
			usePlaylistStore.setState({
				items: [
					{
						id: "item-1",
						title: "Amazing Grace",
						content: "lyrics",
						background: {
							type: "image",
							url: "https://example.com/configured.jpg",
							brightness: 95,
							color: "#2e1065",
						},
					},
				],
				editingItemId: "item-1",
			});
			render(<PlaylistItemEditor />);

			await user.click(screen.getByRole("tab", { name: "Background" }));

			// Add configured image so thumbnail appears in gallery and is selected
			await user.click(screen.getByRole("button", { name: "Add Image" }));
			const urlInput = screen.getByLabelText("Direct Image URL");
			await user.type(urlInput, "https://example.com/configured.jpg");
			await user.click(screen.getByRole("button", { name: "Add" }));

			const selectedThumb = screen.getByRole("radio", {
				name: /Select gallery image 1/i,
			});
			expect(selectedThumb).toHaveAttribute("aria-checked", "true");
			// Deselect image
			await user.click(selectedThumb);
			expect(selectedThumb).toHaveAttribute("aria-checked", "false");

			const saveButton = screen.getByRole("button", { name: "Save" });
			await user.click(saveButton);

			await waitFor(() => {
				const item = usePlaylistStore
					.getState()
					.items.find((i) => i.id === "item-1");
				expect(item?.background).toEqual({
					type: "color",
					color: "#2e1065",
					brightness: 95,
				});
			});
		});

		it("handles valid file upload via gallery popover: converts to Data URL and marks form dirty", async () => {
			render(<PlaylistItemEditor />);

			const user = userEvent.setup();
			await user.click(screen.getByRole("tab", { name: "Background" }));

			// Open Add Image popover
			await user.click(screen.getByRole("button", { name: "Add Image" }));

			const fileInput = screen.getByLabelText(
				/upload from device/i,
			) as HTMLInputElement;
			expect(fileInput).not.toBeNull();
			const file = new File(["fake-image-bytes"], "background.png", {
				type: "image/png",
			});

			await user.upload(fileInput, file);

			// Wait for FileReader async onload to complete and select thumbnail
			await waitFor(() => {
				const thumb = screen.getByRole("radio", {
					name: /Select gallery image 1/i,
				});
				expect(thumb).toHaveAttribute("aria-checked", "true");
			});

			// Save should persist the data URL
			const saveButton = screen.getByRole("button", { name: "Save" });
			await user.click(saveButton);

			await waitFor(() => {
				const item = usePlaylistStore
					.getState()
					.items.find((i) => i.id === "item-1");
				expect(item?.background?.type).toBe("image");
				if (item?.background?.type === "image") {
					expect(item.background.url).toMatch(/^data:image\/png/);
				}
			});
		});

		it("shows inline validation error when file exceeds 5MB limit in gallery popover", async () => {
			render(<PlaylistItemEditor />);

			const user = userEvent.setup();
			await user.click(screen.getByRole("tab", { name: "Background" }));

			await user.click(screen.getByRole("button", { name: "Add Image" }));

			const fileInput = screen.getByLabelText(
				/upload from device/i,
			) as HTMLInputElement;
			expect(fileInput).not.toBeNull();
			const largeBlob = new Uint8Array(5 * 1024 * 1024 + 1);
			const largeFile = new File([largeBlob], "huge.jpg", {
				type: "image/jpeg",
			});

			await user.upload(fileInput, largeFile);

			const alert = await screen.findByRole("alert");
			expect(alert).toHaveTextContent("Image size must be 5MB or less.");
		});

		it("shows inline validation error when file is not JPEG, PNG, or WebP in gallery popover", async () => {
			render(<PlaylistItemEditor />);

			const user = userEvent.setup({ applyAccept: false });
			await user.click(screen.getByRole("tab", { name: "Background" }));

			await user.click(screen.getByRole("button", { name: "Add Image" }));

			const fileInput = screen.getByLabelText(
				/upload from device/i,
			) as HTMLInputElement;
			expect(fileInput).not.toBeNull();
			const gifFile = new File(["gif content"], "animation.gif", {
				type: "image/gif",
			});

			await user.upload(fileInput, gifFile);

			const alert = await screen.findByRole("alert");
			expect(alert).toHaveTextContent(
				"Only JPEG, PNG, and WebP images are supported.",
			);
		});

		it("deselecting image from gallery updates background and allows reselecting image", async () => {
			const user = userEvent.setup();
			usePlaylistStore.setState({
				items: [
					{
						id: "item-1",
						title: "Amazing Grace",
						content: "lyrics",
						background: {
							type: "image",
							url: "https://example.com/existing.jpg",
							brightness: 100,
						},
					},
				],
				editingItemId: "item-1",
			});
			render(<PlaylistItemEditor />);

			await user.click(screen.getByRole("tab", { name: "Background" }));

			// Add image into gallery and deselect it
			await user.click(screen.getByRole("button", { name: "Add Image" }));
			const urlInput = screen.getByLabelText("Direct Image URL");
			await user.type(urlInput, "https://example.com/existing.jpg");
			await user.click(screen.getByRole("button", { name: "Add" }));

			const selectedThumb = screen.getByRole("radio", {
				name: /Select gallery image 1/i,
			});
			expect(selectedThumb).toHaveAttribute("aria-checked", "true");
			await user.click(selectedThumb);
			expect(selectedThumb).toHaveAttribute("aria-checked", "false");

			// Save should persist color fallback
			const saveButton = screen.getByRole("button", { name: "Save" });
			await user.click(saveButton);

			await waitFor(() => {
				const item = usePlaylistStore
					.getState()
					.items.find((i) => i.id === "item-1");
				expect(item?.background).toEqual({
					type: "color",
					color: "#000000",
					brightness: 100,
				});
			});
		});

		it("defaults to Black #000000 preset and allows selecting Black preset swatch", async () => {
			const user = userEvent.setup();
			usePlaylistStore.setState({ editingItemId: "item-1" });
			render(<PlaylistItemEditor />);

			await user.click(screen.getByRole("tab", { name: "Background" }));

			// Check that default draft color trigger shows #000000
			expect(
				screen.getByRole("button", {
					name: /Color: #000000/i,
				}),
			).toBeInTheDocument();

			// Open color picker popover
			const trigger = screen.getByRole("button", {
				name: /Color:/i,
			});
			await user.click(trigger);

			const blackSwatch = screen.getByRole("button", { name: "Black" });
			expect(blackSwatch).toBeInTheDocument();
			await user.click(blackSwatch);

			const hexInput = screen.getByLabelText("Hex color value");
			expect(hexInput).toHaveValue("#000000");
		});

		it("selecting preset swatch in ColorPickerField updates color and saves when image is empty", async () => {
			const user = userEvent.setup();
			usePlaylistStore.setState({ editingItemId: "item-1" });
			render(<PlaylistItemEditor />);

			await user.click(screen.getByRole("tab", { name: "Background" }));

			// Open color picker popover
			const trigger = screen.getByRole("button", {
				name: /Color:/i,
			});
			await user.click(trigger);

			const burgundySwatch = screen.getByRole("button", { name: "Burgundy" });
			expect(burgundySwatch).toBeInTheDocument();
			await user.click(burgundySwatch);

			const hexInput = screen.getByLabelText("Hex color value");
			expect(hexInput).toHaveValue("#450a0a");

			const saveButton = screen.getByRole("button", { name: "Save" });
			await user.click(saveButton);

			await waitFor(() => {
				const item = usePlaylistStore
					.getState()
					.items.find((i) => i.id === "item-1");
				expect(item?.background).toEqual({
					type: "color",
					color: "#450a0a",
					brightness: 100,
				});
			});
		});

		it("typing hex value and adjusting brightness saves correct payload", async () => {
			const user = userEvent.setup();
			usePlaylistStore.setState({ editingItemId: "item-1" });
			render(<PlaylistItemEditor />);

			await user.click(screen.getByRole("tab", { name: "Background" }));

			// Open popover to access hex input
			const trigger = screen.getByRole("button", {
				name: /Color:/i,
			});
			await user.click(trigger);

			const hexInput = screen.getByLabelText("Hex color value");
			await user.clear(hexInput);
			await user.type(hexInput, "#123456");

			const brightnessInput = screen.getByLabelText("Brightness");
			await user.clear(brightnessInput);
			await user.type(brightnessInput, "80");

			const saveButton = screen.getByRole("button", { name: "Save" });
			await user.click(saveButton);

			await waitFor(() => {
				const item = usePlaylistStore
					.getState()
					.items.find((i) => i.id === "item-1");
				expect(item?.background?.type).toBe("color");
				if (item?.background?.type === "color") {
					expect(item.background.color).toBe("#123456");
					expect(item.background.brightness).toBe(80);
				}
			});
		});

		it("image prioritizes over color when both image and color are configured", async () => {
			const user = userEvent.setup();
			usePlaylistStore.setState({ editingItemId: "item-1" });
			render(<PlaylistItemEditor />);

			await user.click(screen.getByRole("tab", { name: "Background" }));

			// Set color
			const trigger = screen.getByRole("button", { name: /Color:/i });
			await user.click(trigger);
			const burgundySwatch = screen.getByRole("button", { name: "Burgundy" });
			await user.click(burgundySwatch);

			// Also add image via gallery popover
			await user.click(screen.getByRole("button", { name: "Add Image" }));
			const urlInput = screen.getByLabelText("Direct Image URL");
			await user.type(urlInput, "https://example.com/priority.jpg");
			await user.click(screen.getByRole("button", { name: "Add" }));

			const saveButton = screen.getByRole("button", { name: "Save" });
			await user.click(saveButton);

			await waitFor(() => {
				const item = usePlaylistStore
					.getState()
					.items.find((i) => i.id === "item-1");
				// Image must take priority!
				expect(item?.background).toEqual({
					type: "image",
					url: "https://example.com/priority.jpg",
					brightness: 100,
					color: "#450a0a",
				});
			});
		});

		it("dirty state with background image change triggers discard confirmation dialog when cancelling", async () => {
			const user = userEvent.setup();
			usePlaylistStore.setState({ editingItemId: "item-1" });
			render(<PlaylistItemEditor />);

			await user.click(screen.getByRole("tab", { name: "Background" }));

			// Add image
			await user.click(screen.getByRole("button", { name: "Add Image" }));
			const urlInput = screen.getByLabelText("Direct Image URL");
			await user.type(urlInput, "https://example.com/backdrop.jpg");
			await user.click(screen.getByRole("button", { name: "Add" }));

			const cancelButton = screen.getByRole("button", { name: "Cancel" });
			await user.click(cancelButton);

			const dialog = await screen.findByRole("alertdialog");
			expect(dialog).toBeInTheDocument();
			expect(screen.getByText("Discard unsaved changes?")).toBeInTheDocument();

			// Discarding reverts and closes editor
			const discardButton = screen.getByRole("button", { name: "Discard" });
			await user.click(discardButton);

			await waitFor(() => {
				expect(usePlaylistStore.getState().editingItemId).toBeNull();
			});
		});

		it("recent images: renders gallery when images exist, selecting sets image URL, removing calls removeRecentBackgroundImage", async () => {
			const mockImages = [
				{
					id: "img-1",
					url: "https://example.com/rec1.jpg",
					addedAt: Date.now(),
				},
				{
					id: "img-2",
					url: "https://example.com/rec2.jpg",
					addedAt: Date.now() - 1000,
				},
			];
			const getSpy = vi
				.spyOn(recentImagesModule, "getRecentBackgroundImages")
				.mockResolvedValue(mockImages);
			const removeSpy = vi
				.spyOn(recentImagesModule, "removeRecentBackgroundImage")
				.mockResolvedValue([mockImages[1]]);

			const user = userEvent.setup();
			usePlaylistStore.setState({ editingItemId: "item-1" });
			render(<PlaylistItemEditor />);

			await user.click(screen.getByRole("tab", { name: "Background" }));

			// Gallery visible with thumbnails
			expect(await screen.findByText("Image Gallery")).toBeInTheDocument();
			expect(
				screen.getByRole("radio", {
					name: "Select gallery image 1",
				}),
			).toBeInTheDocument();

			// Clicking gallery image sets image and marks thumbnail as selected
			const radioItem = screen.getByRole("radio", {
				name: "Select gallery image 1",
			});
			await user.click(radioItem);
			expect(radioItem).toHaveAttribute("aria-checked", "true");
			expect(radioItem).not.toHaveAttribute("aria-pressed");
			expect(screen.getByTestId("selected-badge")).toBeInTheDocument();

			// Clicking remove image button on thumbnail 2 opens confirmation popover, confirming calls removeRecentBackgroundImage
			const removeRecentBtns = screen.getAllByRole("button", {
				name: /Remove gallery image/,
			});
			await user.click(removeRecentBtns[1]);
			expect(screen.getByRole("alertdialog")).toBeInTheDocument();
			expect(screen.getByText("Remove image?")).toBeInTheDocument();

			const confirmRemoveBtn = screen.getByRole("button", { name: "Delete" });
			await user.click(confirmRemoveBtn);

			expect(removeSpy).toHaveBeenCalledWith("img-2");
			expect(usePlaylistStore.getState().backgroundGallery).toEqual([
				mockImages[1],
			]);

			// Save should persist selected recent image (img-1 was kept)
			const saveButton = screen.getByRole("button", { name: "Save" });
			await user.click(saveButton);

			await waitFor(() => {
				const item = usePlaylistStore
					.getState()
					.items.find((i) => i.id === "item-1");
				expect(item?.background).toEqual({
					type: "image",
					url: "https://example.com/rec1.jpg",
					brightness: 100,
					color: "#000000",
				});
			});

			getSpy.mockRestore();
			removeSpy.mockRestore();
		});

		it("deleting the currently selected image automatically deselects it and reverts to base color", async () => {
			const mockImages = [
				{
					id: "img-1",
					url: "https://example.com/rec1.jpg",
					addedAt: Date.now(),
				},
			];
			const getSpy = vi
				.spyOn(recentImagesModule, "getRecentBackgroundImages")
				.mockResolvedValue(mockImages);
			const removeSpy = vi
				.spyOn(recentImagesModule, "removeRecentBackgroundImage")
				.mockResolvedValue([]);

			const user = userEvent.setup();
			usePlaylistStore.setState({ editingItemId: "item-1" });
			render(<PlaylistItemEditor />);

			await user.click(screen.getByRole("tab", { name: "Background" }));

			// Select the image
			const radioItem = await screen.findByRole("radio", {
				name: "Select gallery image 1",
			});
			await user.click(radioItem);
			expect(radioItem).toHaveAttribute("aria-checked", "true");

			// Remove it via delete confirmation
			const removeBtn = screen.getByRole("button", {
				name: /Remove gallery image 1/,
			});
			await user.click(removeBtn);

			const confirmBtn = screen.getByRole("button", { name: "Delete" });
			await user.click(confirmBtn);

			expect(removeSpy).toHaveBeenCalledWith("img-1");

			// Save and verify background reverted to color
			const saveButton = screen.getByRole("button", { name: "Save" });
			await user.click(saveButton);

			await waitFor(() => {
				const item = usePlaylistStore
					.getState()
					.items.find((i) => i.id === "item-1");
				expect(item?.background).toEqual({
					type: "color",
					color: "#000000",
					brightness: 100,
				});
			});

			getSpy.mockRestore();
			removeSpy.mockRestore();
		});

		it("dirty state with solid color change triggers discard confirmation dialog when cancelling", async () => {
			const user = userEvent.setup();
			usePlaylistStore.setState({ editingItemId: "item-1" });
			render(<PlaylistItemEditor />);

			await user.click(screen.getByRole("tab", { name: "Background" }));

			const trigger = screen.getByRole("button", {
				name: /Color:/i,
			});
			await user.click(trigger);

			const swatch = screen.getByRole("button", { name: "Forest Green" });
			await user.click(swatch);

			const cancelButton = screen.getByRole("button", { name: "Cancel" });
			await user.click(cancelButton);

			const dialog = await screen.findByRole("alertdialog");
			expect(dialog).toBeInTheDocument();

			const discardButton = screen.getByRole("button", { name: "Discard" });
			await user.click(discardButton);

			await waitFor(() => {
				expect(usePlaylistStore.getState().editingItemId).toBeNull();
			});
		});
	});
});
