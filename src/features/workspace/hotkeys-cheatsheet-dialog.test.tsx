import { afterEach, describe, expect, it, vi } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HotkeysCheatsheetDialog } from "./hotkeys-cheatsheet-dialog";

describe("HotkeysCheatsheetDialog", () => {
	afterEach(() => {
		cleanup();
	});

	it("does not render dialog content when closed", () => {
		render(<HotkeysCheatsheetDialog open={false} />);

		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	it("renders dialog content and header when open, with accessible attributes", () => {
		render(<HotkeysCheatsheetDialog open={true} />);

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
		render(<HotkeysCheatsheetDialog open={true} />);

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
		render(<HotkeysCheatsheetDialog open={true} />);

		const searchInput = screen.getByPlaceholderText("Search shortcuts...");
		await user.type(searchInput, "nonexistent-action-xyz");

		expect(
			screen.getByText(/No shortcuts found matching/i),
		).toBeInTheDocument();
	});

	it("renders shortcut categories and keycap tokens declaratively", () => {
		render(<HotkeysCheatsheetDialog open={true} />);

		// Verify category headers
		expect(
			screen.getByRole("heading", { name: "Workspace" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("heading", { name: "Presentation" }),
		).toBeInTheDocument();

		// Verify shortcut names and keycaps
		expect(screen.getByText("Toggle layout mode")).toBeInTheDocument();
		expect(screen.getByText("E")).toBeInTheDocument();
	});

	it("calls onOpenChange(false) when close button is clicked in controlled mode", async () => {
		const user = userEvent.setup();
		const onOpenChange = vi.fn();

		render(<HotkeysCheatsheetDialog open={true} onOpenChange={onOpenChange} />);

		const closeButton = screen.getByRole("button", { name: /close/i });
		await user.click(closeButton);

		expect(onOpenChange).toHaveBeenCalledWith(false);
	});
});
