import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HotkeysCheatsheetDialog } from "./hotkeys-cheatsheet-dialog";
import { useWorkspaceStore } from "./store";

describe("HotkeysCheatsheetDialog", () => {
	beforeEach(() => {
		useWorkspaceStore.setState({ isCheatsheetOpen: false });
	});

	afterEach(() => {
		cleanup();
		useWorkspaceStore.setState({ isCheatsheetOpen: false });
	});

	it("does not render dialog content when closed", () => {
		useWorkspaceStore.setState({ isCheatsheetOpen: false });
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

	it("filters shortcuts list based on search input query", async () => {
		const user = userEvent.setup();
		useWorkspaceStore.setState({ isCheatsheetOpen: true });
		render(<HotkeysCheatsheetDialog />);

		const searchInput = screen.getByPlaceholderText("Search shortcuts...");
		expect(searchInput).toBeInTheDocument();

		// Initially all shortcuts are visible
		expect(screen.getByText("Toggle layout mode")).toBeInTheDocument();
		expect(screen.getByText("Go live")).toBeInTheDocument();

		// Type search query to filter
		await user.type(searchInput, "layout");

		expect(screen.getByText("Toggle layout mode")).toBeInTheDocument();
		expect(screen.queryByText("Go live")).not.toBeInTheDocument();
	});

	it("shows empty state when search query matches no shortcuts", async () => {
		const user = userEvent.setup();
		useWorkspaceStore.setState({ isCheatsheetOpen: true });
		render(<HotkeysCheatsheetDialog />);

		const searchInput = screen.getByPlaceholderText("Search shortcuts...");
		await user.type(searchInput, "nonexistent-action-xyz");

		expect(
			screen.getByText(/No shortcuts found matching/i),
		).toBeInTheDocument();
	});

	it("closes dialog and updates store when close button is clicked", async () => {
		const user = userEvent.setup();
		useWorkspaceStore.setState({ isCheatsheetOpen: true });

		render(<HotkeysCheatsheetDialog />);

		const closeButton = screen.getByRole("button", { name: /close/i });
		await user.click(closeButton);

		expect(useWorkspaceStore.getState().isCheatsheetOpen).toBe(false);
	});
});
