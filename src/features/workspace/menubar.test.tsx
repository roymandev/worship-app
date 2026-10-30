import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WorkspaceMenubar } from "./menubar";
import { useWorkspaceStore } from "./store";

describe("WorkspaceMenubar", () => {
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

	it("renders menubar and top-level triggers with accessible roles", () => {
		render(<WorkspaceMenubar />);

		const menubar = screen.getByRole("menubar");
		expect(menubar).toBeInTheDocument();

		const viewTrigger = screen.getByRole("menuitem", { name: "View" });
		const helpTrigger = screen.getByRole("menuitem", { name: "Help" });

		expect(viewTrigger).toBeInTheDocument();
		expect(helpTrigger).toBeInTheDocument();
	});

	it("handles keyboard tab navigation to trigger and arrow roving in menu", async () => {
		const user = userEvent.setup();
		render(
			<div>
				<button type="button">Pre-Focus</button>
				<WorkspaceMenubar />
			</div>,
		);

		const preButton = screen.getByRole("button", { name: "Pre-Focus" });
		const viewTrigger = screen.getByRole("menuitem", { name: "View" });

		await user.tab();
		expect(preButton).toHaveFocus();

		await user.tab();
		expect(viewTrigger).toHaveFocus();

		// Open View menu via Enter
		await user.keyboard("{Enter}");

		const menu = screen.getByRole("menu");
		expect(menu).toBeInTheDocument();

		const toggleLayoutItem = screen.getByRole("menuitem", {
			name: /Toggle layout mode/i,
		});
		const resetLayoutItem = screen.getByRole("menuitem", {
			name: /Reset layout to defaults\.\.\./i,
		});

		expect(toggleLayoutItem).toBeInTheDocument();
		expect(resetLayoutItem).toBeInTheDocument();

		// Destructive Reset Layout item check
		expect(resetLayoutItem).toHaveAttribute("data-variant", "destructive");

		// Keyboard roving focus verification
		toggleLayoutItem.focus();
		expect(toggleLayoutItem).toHaveFocus();

		resetLayoutItem.focus();
		expect(resetLayoutItem).toHaveFocus();
	});

	it("renders done editing label when in edit mode and triggers store mode change", async () => {
		const user = userEvent.setup();
		useWorkspaceStore.setState({ mode: "edit" });

		render(<WorkspaceMenubar />);

		const viewTrigger = screen.getByRole("menuitem", { name: "View" });
		await user.click(viewTrigger);

		const doneEditingItem = screen.getByRole("menuitem", {
			name: /Done Editing/i,
		});
		expect(doneEditingItem).toBeInTheDocument();

		await user.click(doneEditingItem);
		expect(useWorkspaceStore.getState().mode).toBe("view");
	});

	it("opens reset confirmation dialog when clicking reset layout item", async () => {
		const user = userEvent.setup();
		render(<WorkspaceMenubar />);

		const viewTrigger = screen.getByRole("menuitem", { name: "View" });
		await user.click(viewTrigger);

		const resetLayoutItem = screen.getByRole("menuitem", {
			name: /Reset layout to defaults\.\.\./i,
		});
		expect(resetLayoutItem).toHaveAttribute("data-variant", "destructive");

		await user.click(resetLayoutItem);
		expect(useWorkspaceStore.getState().isResetDialogOpen).toBe(true);
	});

	it("opens cheatsheet when clicking help menu item", async () => {
		const user = userEvent.setup();
		render(<WorkspaceMenubar />);

		const helpTrigger = screen.getByRole("menuitem", { name: "Help" });
		await user.click(helpTrigger);

		const shortcutsItem = screen.getByRole("menuitem", {
			name: /Keyboard shortcuts/i,
		});
		expect(shortcutsItem).toBeInTheDocument();

		await user.click(shortcutsItem);
		expect(useWorkspaceStore.getState().isCheatsheetOpen).toBe(true);
	});
});
