import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "./dropdown-menu";

describe("DropdownMenu component", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders dropdown menu items with appropriate focus indicators and roles", async () => {
		const user = userEvent.setup();
		render(
			<DropdownMenu>
				<DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem>Profile</DropdownMenuItem>
					<DropdownMenuCheckboxItem checked>
						Show Notifications
					</DropdownMenuCheckboxItem>
					<DropdownMenuRadioGroup value="dark">
						<DropdownMenuRadioItem value="dark">
							Dark Mode
						</DropdownMenuRadioItem>
					</DropdownMenuRadioGroup>
					<DropdownMenuSub>
						<DropdownMenuSubTrigger>Settings</DropdownMenuSubTrigger>
						<DropdownMenuSubContent>
							<DropdownMenuItem>General</DropdownMenuItem>
						</DropdownMenuSubContent>
					</DropdownMenuSub>
					<DropdownMenuItem variant="destructive">
						Delete Account
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>,
		);

		const trigger = screen.getByRole("button", { name: "Open Menu" });
		expect(trigger).toBeInTheDocument();

		await user.click(trigger);

		const menu = screen.getByRole("menu");
		expect(menu).toBeInTheDocument();

		const defaultItem = screen.getByRole("menuitem", { name: "Profile" });
		const checkboxItem = screen.getByRole("menuitemcheckbox", {
			name: "Show Notifications",
		});
		const radioItem = screen.getByRole("menuitemradio", {
			name: "Dark Mode",
		});
		const subTrigger = screen.getByRole("menuitem", { name: "Settings" });
		const destructiveItem = screen.getByRole("menuitem", {
			name: "Delete Account",
		});

		expect(defaultItem).toBeInTheDocument();
		expect(checkboxItem).toBeInTheDocument();
		expect(radioItem).toBeInTheDocument();
		expect(subTrigger).toBeInTheDocument();
		expect(destructiveItem).toHaveAttribute("data-variant", "destructive");

		// Keyboard focus
		defaultItem.focus();
		expect(defaultItem).toHaveFocus();

		destructiveItem.focus();
		expect(destructiveItem).toHaveFocus();
	});

	it("opens menu via keyboard Enter on trigger and closes on Escape", async () => {
		const user = userEvent.setup();
		render(
			<div>
				<button type="button">Previous</button>
				<DropdownMenu>
					<DropdownMenuTrigger>Actions</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuItem>Edit</DropdownMenuItem>
						<DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>,
		);

		await user.tab();
		expect(screen.getByRole("button", { name: "Previous" })).toHaveFocus();

		await user.tab();
		const trigger = screen.getByRole("button", { name: "Actions" });
		expect(trigger).toHaveFocus();

		await user.keyboard("{Enter}");
		const editItem = screen.getByRole("menuitem", { name: "Edit" });
		expect(editItem).toBeInTheDocument();

		await user.keyboard("{Escape}");
		expect(trigger).toHaveFocus();
	});
});
