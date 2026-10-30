import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef, useState } from "react";
import { PlaylistDeleteConfirmPopover } from "./delete-confirm-popover";

afterEach(() => {
	cleanup();
});

describe("PlaylistDeleteConfirmPopover", () => {
	it("renders with role='alertdialog' semantics", () => {
		render(
			<PlaylistDeleteConfirmPopover
				itemId="item-1"
				open={true}
				onOpenChange={() => {}}
				onConfirm={() => {}}
			/>,
		);

		const dialog = screen.getByRole("alertdialog");
		expect(dialog).toBeInTheDocument();
		expect(dialog).toHaveAccessibleName("Delete this item?");
		expect(screen.getByText("Delete this item?")).toBeInTheDocument();
		expect(
			screen.getByText("Are you sure you want to delete this item?"),
		).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
	});

	it("autofocuses on the safe Cancel button upon opening", async () => {
		render(
			<PlaylistDeleteConfirmPopover
				itemId="item-1"
				open={true}
				onOpenChange={() => {}}
				onConfirm={() => {}}
			/>,
		);

		const cancelBtn = screen.getByRole("button", { name: "Cancel" });
		await waitFor(() => expect(cancelBtn).toHaveFocus());
	});

	it("cycles Tab and Shift+Tab between Cancel and Delete buttons, defaulting to Cancel if container is focused", async () => {
		const user = userEvent.setup();

		render(
			<PlaylistDeleteConfirmPopover
				itemId="item-1"
				open={true}
				onOpenChange={() => {}}
				onConfirm={() => {}}
			/>,
		);

		const cancelBtn = screen.getByRole("button", { name: "Cancel" });
		const deleteBtn = screen.getByRole("button", { name: "Delete" });
		const dialog = screen.getByRole("alertdialog");

		await waitFor(() => expect(cancelBtn).toHaveFocus());

		// Shift+Tab from Cancel moves backward to Delete
		await user.keyboard("{Shift>}{Tab}{/Shift}");
		expect(deleteBtn).toHaveFocus();

		// Shift+Tab from Delete moves backward to Cancel
		await user.keyboard("{Shift>}{Tab}{/Shift}");
		expect(cancelBtn).toHaveFocus();

		// Tab from Cancel moves forward to Delete
		await user.keyboard("{Tab}");
		expect(deleteBtn).toHaveFocus();

		// Tab from Delete moves forward back to Cancel
		await user.keyboard("{Tab}");
		expect(cancelBtn).toHaveFocus();

		// If focus is somehow on dialog/container/fallback, Tab moves safely to Cancel
		dialog.focus();
		expect(dialog).toHaveFocus();

		await user.keyboard("{Tab}");
		expect(cancelBtn).toHaveFocus();

		// If focus is on dialog/container/fallback, Shift+Tab moves to Delete (last focusable element)
		dialog.focus();
		expect(dialog).toHaveFocus();

		await user.keyboard("{Shift>}{Tab}{/Shift}");
		expect(deleteBtn).toHaveFocus();
	});

	it("navigates horizontally with boundary clamping", async () => {
		const user = userEvent.setup();

		render(
			<PlaylistDeleteConfirmPopover
				itemId="item-1"
				open={true}
				onOpenChange={() => {}}
				onConfirm={() => {}}
			/>,
		);

		const cancelBtn = screen.getByRole("button", { name: "Cancel" });
		const deleteBtn = screen.getByRole("button", { name: "Delete" });

		await waitFor(() => expect(cancelBtn).toHaveFocus());

		// ArrowLeft on Cancel stays clamped on Cancel
		await user.keyboard("{ArrowLeft}");
		expect(cancelBtn).toHaveFocus();

		// ArrowRight from Cancel moves focus to Delete
		await user.keyboard("{ArrowRight}");
		expect(deleteBtn).toHaveFocus();

		// ArrowRight on Delete stays clamped on Delete
		await user.keyboard("{ArrowRight}");
		expect(deleteBtn).toHaveFocus();

		// ArrowLeft from Delete moves focus to Cancel
		await user.keyboard("{ArrowLeft}");
		expect(cancelBtn).toHaveFocus();
	});

	it("suppresses vertical arrow keys (ArrowUp and ArrowDown preventDefault and stopPropagation)", async () => {
		const user = userEvent.setup();

		render(
			<PlaylistDeleteConfirmPopover
				itemId="item-1"
				open={true}
				onOpenChange={() => {}}
				onConfirm={() => {}}
			/>,
		);

		const cancelBtn = screen.getByRole("button", { name: "Cancel" });
		const deleteBtn = screen.getByRole("button", { name: "Delete" });

		await waitFor(() => expect(cancelBtn).toHaveFocus());

		// ArrowDown on Cancel does not change focus
		await user.keyboard("{ArrowDown}");
		expect(cancelBtn).toHaveFocus();

		// ArrowUp on Cancel does not change focus
		await user.keyboard("{ArrowUp}");
		expect(cancelBtn).toHaveFocus();

		// Move to Delete
		await user.keyboard("{ArrowRight}");
		expect(deleteBtn).toHaveFocus();

		// ArrowDown on Delete does not change focus
		await user.keyboard("{ArrowDown}");
		expect(deleteBtn).toHaveFocus();

		// ArrowUp on Delete does not change focus
		await user.keyboard("{ArrowUp}");
		expect(deleteBtn).toHaveFocus();
	});

	it("dismisses popover via Escape key calling onOpenChange(false) and restores focus to trigger", async () => {
		const user = userEvent.setup();
		const onOpenChange = mock((_open: boolean) => {});

		function TestComponent() {
			const [open, setOpen] = useState(false);
			const triggerRef = useRef<HTMLButtonElement | null>(null);
			return (
				<div>
					<PlaylistDeleteConfirmPopover
						itemId="item-1"
						open={open}
						onOpenChange={(nextOpen) => {
							setOpen(nextOpen);
							onOpenChange(nextOpen);
						}}
						onConfirm={() => {}}
						triggerRef={triggerRef}
						trigger={
							<button ref={triggerRef} type="button">
								Delete item
							</button>
						}
					/>
				</div>
			);
		}

		render(<TestComponent />);

		const triggerBtn = screen.getByRole("button", { name: "Delete item" });
		await user.click(triggerBtn);

		const cancelBtn = screen.getByRole("button", { name: "Cancel" });
		await waitFor(() => expect(cancelBtn).toHaveFocus());

		await user.keyboard("{Escape}");
		expect(onOpenChange).toHaveBeenCalledWith(false);
		expect(triggerBtn).toHaveFocus();
	});

	it("confirms deletion via Enter or Space key on Delete button", async () => {
		const user = userEvent.setup();
		const onConfirm = mock(() => {});

		render(
			<PlaylistDeleteConfirmPopover
				itemId="item-1"
				open={true}
				onOpenChange={() => {}}
				onConfirm={onConfirm}
			/>,
		);

		const deleteBtn = screen.getByRole("button", { name: "Delete" });
		await waitFor(() =>
			expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus(),
		);
		deleteBtn.focus();
		expect(deleteBtn).toHaveFocus();

		await user.keyboard("{Enter}");
		expect(onConfirm).toHaveBeenCalledTimes(1);

		await user.keyboard(" ");
		expect(onConfirm).toHaveBeenCalledTimes(2);
	});
});
