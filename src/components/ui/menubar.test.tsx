import { afterEach, describe, expect, it } from "bun:test";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
	Menubar,
	MenubarCheckboxItem,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarRadioGroup,
	MenubarRadioItem,
	MenubarSub,
	MenubarSubContent,
	MenubarSubTrigger,
	MenubarTrigger,
} from "./menubar";

describe("Menubar component", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders menubar and triggers with accessible roles", () => {
		render(
			<Menubar>
				<MenubarMenu>
					<MenubarTrigger>View</MenubarTrigger>
					<MenubarContent>
						<MenubarItem>Toggle Layout</MenubarItem>
					</MenubarContent>
				</MenubarMenu>
				<MenubarMenu>
					<MenubarTrigger>Help</MenubarTrigger>
					<MenubarContent>
						<MenubarItem>Documentation</MenubarItem>
					</MenubarContent>
				</MenubarMenu>
			</Menubar>,
		);

		const menubar = screen.getByRole("menubar");
		expect(menubar).toBeInTheDocument();

		const viewTrigger = screen.getByRole("menuitem", { name: "View" });
		const helpTrigger = screen.getByRole("menuitem", { name: "Help" });

		expect(viewTrigger).toBeInTheDocument();
		expect(helpTrigger).toBeInTheDocument();
	});

	it("handles keyboard tab navigation to focus menubar trigger", async () => {
		const user = userEvent.setup();
		render(
			<div>
				<button type="button">Before</button>
				<Menubar>
					<MenubarMenu>
						<MenubarTrigger>View</MenubarTrigger>
						<MenubarContent>
							<MenubarItem>Toggle Layout</MenubarItem>
						</MenubarContent>
					</MenubarMenu>
				</Menubar>
			</div>,
		);

		const beforeButton = screen.getByRole("button", { name: "Before" });
		const viewTrigger = screen.getByRole("menuitem", { name: "View" });

		expect(viewTrigger).not.toHaveFocus();

		await user.tab();
		expect(beforeButton).toHaveFocus();

		await user.tab();
		expect(viewTrigger).toHaveFocus();
	});

	it("handles pointer click to open menu and restores focus to trigger on Escape", async () => {
		const user = userEvent.setup();
		render(
			<Menubar>
				<MenubarMenu>
					<MenubarTrigger>View</MenubarTrigger>
					<MenubarContent>
						<MenubarItem>Toggle Layout</MenubarItem>
					</MenubarContent>
				</MenubarMenu>
			</Menubar>,
		);

		const viewTrigger = screen.getByRole("menuitem", { name: "View" });
		expect(viewTrigger).not.toHaveFocus();

		await user.click(viewTrigger);

		const menu = screen.getByRole("menu");
		expect(menu).toBeInTheDocument();
		expect(
			screen.getByRole("menuitem", { name: "Toggle Layout" }),
		).toBeInTheDocument();

		await user.keyboard("{Escape}");
		expect(viewTrigger).toHaveFocus();
	});

	it("supports roving keyboard navigation through menubar items with Arrow keys", async () => {
		const user = userEvent.setup();
		render(
			<Menubar>
				<MenubarMenu>
					<MenubarTrigger>Settings</MenubarTrigger>
					<MenubarContent>
						<MenubarItem>Profile</MenubarItem>
						<MenubarCheckboxItem checked>Show Grid</MenubarCheckboxItem>
						<MenubarRadioGroup value="compact">
							<MenubarRadioItem value="compact">Compact Mode</MenubarRadioItem>
						</MenubarRadioGroup>
						<MenubarSub>
							<MenubarSubTrigger>Preferences</MenubarSubTrigger>
							<MenubarSubContent>
								<MenubarItem>Audio</MenubarItem>
							</MenubarSubContent>
						</MenubarSub>
						<MenubarItem variant="destructive">Reset Layout</MenubarItem>
					</MenubarContent>
				</MenubarMenu>
			</Menubar>,
		);

		const trigger = screen.getByRole("menuitem", { name: "Settings" });
		await user.click(trigger);

		const defaultItem = screen.getByRole("menuitem", { name: "Profile" });
		const checkboxItem = screen.getByRole("menuitemcheckbox", {
			name: "Show Grid",
		});
		const radioItem = screen.getByRole("menuitemradio", {
			name: "Compact Mode",
		});
		const subTrigger = screen.getByRole("menuitem", { name: "Preferences" });
		const destructiveItem = screen.getByRole("menuitem", {
			name: "Reset Layout",
		});

		expect(defaultItem).toBeInTheDocument();
		expect(checkboxItem).toBeInTheDocument();
		expect(radioItem).toBeInTheDocument();
		expect(subTrigger).toBeInTheDocument();
		expect(destructiveItem).toHaveAttribute("data-variant", "destructive");

		// Keyboard focus verification
		act(() => {
			defaultItem.focus();
		});
		expect(defaultItem).toHaveFocus();

		act(() => {
			destructiveItem.focus();
		});
		expect(destructiveItem).toHaveFocus();
	});
});
