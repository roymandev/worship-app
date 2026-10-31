import { describe, expect, it, mock } from "bun:test";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { PlaylistDeleteConfirmPopover } from "./delete-confirm-popover";

describe("PlaylistDeleteConfirmPopover", () => {
	function TestWrapper({
		open = true,
		itemId = "test-item-1",
		onConfirm = mock(),
		onClose = mock(),
	}: {
		open?: boolean;
		itemId?: string | null;
		onConfirm?: () => void;
		onClose?: () => void;
	}) {
		const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);

		return (
			<div>
				<button ref={setAnchor} type="button" id="anchor-btn">
					Anchor
				</button>
				<PlaylistDeleteConfirmPopover
					open={open}
					anchor={anchor}
					itemId={itemId}
					onConfirm={onConfirm}
					onClose={onClose}
				/>
			</div>
		);
	}

	it("renders title and description when open with an anchor element", () => {
		render(<TestWrapper />);

		expect(screen.getByRole("alertdialog")).toBeInTheDocument();
		expect(screen.getByText("Delete this item?")).toBeInTheDocument();
		expect(
			screen.getByText("Are you sure you want to delete this item?"),
		).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
	});

	it("initial focus is placed on the Cancel button", async () => {
		render(<TestWrapper />);

		const cancelBtn = screen.getByRole("button", { name: "Cancel" });
		await waitFor(() => expect(cancelBtn).toHaveFocus());
	});

	it("clicking Cancel triggers onClose", async () => {
		const user = userEvent.setup();
		const onClose = mock();
		render(<TestWrapper onClose={onClose} />);

		const cancelBtn = screen.getByRole("button", { name: "Cancel" });
		await user.click(cancelBtn);
		expect(onClose).toHaveBeenCalled();
	});

	it("pressing Escape triggers onClose", async () => {
		const user = userEvent.setup();
		const onClose = mock();
		render(<TestWrapper onClose={onClose} />);

		const cancelBtn = screen.getByRole("button", { name: "Cancel" });
		await waitFor(() => expect(cancelBtn).toHaveFocus());
		await user.keyboard("{Escape}");
		expect(onClose).toHaveBeenCalled();
	});

	it("clicking Delete triggers onConfirm", async () => {
		const user = userEvent.setup();
		const onConfirm = mock();
		render(<TestWrapper onConfirm={onConfirm} />);

		const deleteBtn = screen.getByRole("button", { name: "Delete" });
		await user.click(deleteBtn);
		expect(onConfirm).toHaveBeenCalledTimes(1);
	});

	it("ArrowRight moves focus from Cancel to Delete; ArrowLeft moves focus from Delete to Cancel", async () => {
		const user = userEvent.setup();
		render(<TestWrapper />);

		const cancelBtn = screen.getByRole("button", { name: "Cancel" });
		const deleteBtn = screen.getByRole("button", { name: "Delete" });

		await waitFor(() => expect(cancelBtn).toHaveFocus());

		// Cancel -> ArrowRight -> Delete
		await user.keyboard("{ArrowRight}");
		expect(deleteBtn).toHaveFocus();

		// Clamped at Delete
		await user.keyboard("{ArrowRight}");
		expect(deleteBtn).toHaveFocus();

		// Delete -> ArrowLeft -> Cancel
		await user.keyboard("{ArrowLeft}");
		expect(cancelBtn).toHaveFocus();

		// Clamped at Cancel
		await user.keyboard("{ArrowLeft}");
		expect(cancelBtn).toHaveFocus();
	});

	it("ArrowUp and ArrowDown are prevented/ignored", async () => {
		const user = userEvent.setup();
		render(<TestWrapper />);

		const cancelBtn = screen.getByRole("button", { name: "Cancel" });
		await waitFor(() => expect(cancelBtn).toHaveFocus());

		await user.keyboard("{ArrowUp}");
		expect(cancelBtn).toHaveFocus();

		await user.keyboard("{ArrowDown}");
		expect(cancelBtn).toHaveFocus();
	});

	it("Tab and Shift+Tab cycle focus between Cancel and Delete with boundary clamping", async () => {
		const user = userEvent.setup();
		render(<TestWrapper />);

		const cancelBtn = screen.getByRole("button", { name: "Cancel" });
		const deleteBtn = screen.getByRole("button", { name: "Delete" });
		const dialog = screen.getByRole("alertdialog");

		await waitFor(() => expect(cancelBtn).toHaveFocus());

		// Tab from Cancel -> Delete
		await user.keyboard("{Tab}");
		expect(deleteBtn).toHaveFocus();

		// Tab from Delete -> Cancel (cycles forward)
		await user.keyboard("{Tab}");
		expect(cancelBtn).toHaveFocus();

		// Shift+Tab from Cancel -> Delete (cycles backward)
		await user.keyboard("{Shift>}{Tab}{/Shift}");
		expect(deleteBtn).toHaveFocus();

		// Shift+Tab from Delete -> Cancel
		await user.keyboard("{Shift>}{Tab}{/Shift}");
		expect(cancelBtn).toHaveFocus();

		// If focus is on dialog container, Tab moves safely to Cancel
		act(() => {
			dialog.focus();
		});
		expect(dialog).toHaveFocus();
		await user.keyboard("{Tab}");
		expect(cancelBtn).toHaveFocus();
	});
});
