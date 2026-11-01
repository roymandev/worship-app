import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HotkeysCheatsheetDialog } from "./hotkeys-cheatsheet-dialog";
import { useWorkspaceStore } from "./store";

describe("HotkeysCheatsheetDialog", () => {
	beforeEach(() => {
		useWorkspaceStore.setState({
			mode: "view",
			isResetDialogOpen: false,
			isCheatsheetOpen: false,
		});
	});

	afterEach(() => {
		cleanup();
	});

	it("does not render dialog content when closed", () => {
		render(<HotkeysCheatsheetDialog />);

		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	it("renders dialog content and header when open, with accessible attributes", () => {
		useWorkspaceStore.setState({ isCheatsheetOpen: true });
		render(<HotkeysCheatsheetDialog />);

		const dialog = screen.getByRole("dialog");
		expect(dialog).toBeInTheDocument();
		expect(dialog).toHaveAttribute("role", "dialog");
		expect(dialog).toHaveAttribute("aria-labelledby");
		expect(dialog).toHaveAttribute("aria-describedby");
		expect(
			screen.getByRole("heading", { name: "Keyboard Shortcuts" }),
		).toBeInTheDocument();
	});

	it("opens when openCheatsheet action is invoked", () => {
		render(<HotkeysCheatsheetDialog />);
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

		act(() => {
			useWorkspaceStore.getState().openCheatsheet();
		});

		expect(screen.getByRole("dialog")).toBeInTheDocument();
	});

	it("filters shortcuts list based on search input query and updates live region", async () => {
		const user = userEvent.setup();
		useWorkspaceStore.setState({ isCheatsheetOpen: true });
		render(<HotkeysCheatsheetDialog />);

		const searchInput = screen.getByPlaceholderText("Search shortcuts...");
		expect(searchInput).toBeInTheDocument();

		// Initially all shortcuts are visible and polite live region announces count
		const liveRegion = screen.getByText(/Showing \d+ keyboard shortcuts/i);
		expect(liveRegion).toBeInTheDocument();
		expect(liveRegion).toHaveAttribute("aria-live", "polite");

		expect(screen.getByText("Toggle layout mode")).toBeInTheDocument();
		expect(screen.getByText("Go live")).toBeInTheDocument();

		// Type search query to filter
		await user.type(searchInput, "layout");

		expect(screen.getByText("Toggle layout mode")).toBeInTheDocument();
		expect(screen.queryByText("Go live")).not.toBeInTheDocument();

		// Live region reflects filtered count
		expect(
			screen.getByText("Showing 2 keyboard shortcuts"),
		).toBeInTheDocument();
	});

	it("shows empty state when search query matches no shortcuts and announces zero results", async () => {
		const user = userEvent.setup();
		useWorkspaceStore.setState({ isCheatsheetOpen: true });
		render(<HotkeysCheatsheetDialog />);

		const searchInput = screen.getByPlaceholderText("Search shortcuts...");
		await user.type(searchInput, "nonexistent-action-xyz");

		expect(
			screen.getByText(/No shortcuts found matching/i),
		).toBeInTheDocument();
		expect(
			screen.getByText('No shortcuts matching "nonexistent-action-xyz"'),
		).toBeInTheDocument();
	});

	it("closes dialog and updates store when close button is clicked", async () => {
		const user = userEvent.setup();
		useWorkspaceStore.setState({ isCheatsheetOpen: true });
		render(<HotkeysCheatsheetDialog />);

		expect(screen.getByRole("dialog")).toBeInTheDocument();

		const closeButton = screen.getByRole("button", { name: /close/i });
		await user.click(closeButton);

		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		expect(useWorkspaceStore.getState().isCheatsheetOpen).toBe(false);
	});
});
