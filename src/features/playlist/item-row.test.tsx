import { afterEach, describe, expect, it, mock } from "bun:test";
import {
	cleanup,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlaylistItemRow, type PlaylistItemRowProps } from "./item-row";
import type { PlaylistItem } from "./store";

function renderPlaylistItemRow(props: PlaylistItemRowProps) {
	return render(
		// biome-ignore lint/a11y/useSemanticElements: APG Composite Grid
		<div role="grid" aria-label="Playlist items">
			<PlaylistItemRow {...props} />
		</div>,
	);
}

describe("PlaylistItemRow", () => {
	const sampleItem: PlaylistItem = {
		id: "item-1",
		title: "Amazing Grace",
		content: "Amazing grace...",
	};

	afterEach(() => {
		cleanup();
	});

	it("renders row with title in view mode with Go Live action", () => {
		renderPlaylistItemRow({
			item: sampleItem,
			isSelected: true,
			mode: "view",
			onSelect: () => {},
			onMoveUp: () => {},
			onMoveDown: () => {},
			onDelete: () => {},
		});

		const row = screen.getByRole("row");
		expect(row).toBeInTheDocument();
		expect(row).toHaveAttribute("tabindex", "0");
		expect(screen.getByText("Amazing Grace")).toBeInTheDocument();

		const goLiveBtn = screen.getByRole("button", { name: "Go Live" });
		expect(goLiveBtn).toBeInTheDocument();
		expect(goLiveBtn).toHaveAttribute("tabindex", "-1");
	});

	it("renders row in edit mode with Move Up (disabled on 1st), Move Down, Edit, Delete", () => {
		renderPlaylistItemRow({
			item: sampleItem,
			isFirst: true,
			isLast: false,
			isSelected: false,
			mode: "edit",
			onSelect: () => {},
			onMoveUp: () => {},
			onMoveDown: () => {},
			onDelete: () => {},
		});

		const moveUpBtn = screen.getByRole("button", { name: "Move up" });
		const moveDownBtn = screen.getByRole("button", { name: "Move down" });
		const editBtn = screen.getByRole("button", { name: "Edit item" });
		const deleteBtn = screen.getByRole("button", { name: "Delete item" });

		expect(moveUpBtn).toBeDisabled();
		expect(moveDownBtn).not.toBeDisabled();
		expect(editBtn).toBeInTheDocument();
		expect(deleteBtn).toBeInTheDocument();

		expect(moveUpBtn).toHaveAttribute("tabindex", "-1");
		expect(moveDownBtn).toHaveAttribute("tabindex", "-1");
		expect(editBtn).toHaveAttribute("tabindex", "-1");
		expect(deleteBtn).toHaveAttribute("tabindex", "-1");
	});

	it("disables Move Down on last item in edit mode", () => {
		renderPlaylistItemRow({
			item: sampleItem,
			isFirst: false,
			isLast: true,
			isSelected: false,
			mode: "edit",
			onSelect: () => {},
			onMoveUp: () => {},
			onMoveDown: () => {},
			onDelete: () => {},
		});

		const moveUpBtn = screen.getByRole("button", { name: "Move up" });
		const moveDownBtn = screen.getByRole("button", { name: "Move down" });

		expect(moveUpBtn).not.toBeDisabled();
		expect(moveDownBtn).toBeDisabled();
	});

	it("calls onMoveUp and onMoveDown when clicked", async () => {
		const user = userEvent.setup();
		const onMoveUp = mock(() => {});
		const onMoveDown = mock(() => {});

		renderPlaylistItemRow({
			item: sampleItem,
			isFirst: false,
			isLast: false,
			isSelected: true,
			mode: "edit",
			onSelect: () => {},
			onMoveUp: onMoveUp,
			onMoveDown: onMoveDown,
			onDelete: () => {},
		});

		const moveUpBtn = screen.getByRole("button", { name: "Move up" });
		const moveDownBtn = screen.getByRole("button", { name: "Move down" });

		await user.click(moveUpBtn);
		expect(onMoveUp).toHaveBeenCalledTimes(1);

		await user.click(moveDownBtn);
		expect(onMoveDown).toHaveBeenCalledTimes(1);
	});

	it("calls onMoveUp and onMoveDown via Alt+ArrowUp / Alt+ArrowDown keyboard shortcuts", async () => {
		const user = userEvent.setup();
		const onMoveUp = mock(() => {});
		const onMoveDown = mock(() => {});

		renderPlaylistItemRow({
			item: sampleItem,
			isFirst: false,
			isLast: false,
			isSelected: true,
			mode: "edit",
			onSelect: () => {},
			onMoveUp: onMoveUp,
			onMoveDown: onMoveDown,
			onDelete: () => {},
		});

		const row = screen.getByRole("row");
		row.focus();
		expect(document.activeElement).toBe(row);

		await user.keyboard("{Alt>}{ArrowUp}{/Alt}");
		expect(onMoveUp).toHaveBeenCalledTimes(1);

		await user.keyboard("{Alt>}{ArrowDown}{/Alt}");
		expect(onMoveDown).toHaveBeenCalledTimes(1);
	});

	it("opens delete confirmation when Delete button is clicked, focuses Cancel, and calls onDelete when confirmed", async () => {
		const user = userEvent.setup();
		const onDelete = mock(() => {});

		renderPlaylistItemRow({
			item: sampleItem,
			isFirst: true,
			isLast: false,
			isSelected: true,
			mode: "edit",
			onSelect: () => {},
			onMoveUp: () => {},
			onMoveDown: () => {},
			onDelete: onDelete,
		});

		const deleteBtn = screen.getByRole("button", { name: "Delete item" });
		await user.click(deleteBtn);

		// Popover should be open
		expect(screen.getByText("Delete this item?")).toBeInTheDocument();
		const cancelBtn = screen.getByRole("button", { name: "Cancel" });
		const confirmBtn = screen.getByRole("button", { name: "Delete" });

		expect(cancelBtn).toBeInTheDocument();
		expect(confirmBtn).toBeInTheDocument();
		await waitFor(() => expect(cancelBtn).toHaveFocus());

		await user.click(confirmBtn);
		expect(onDelete).toHaveBeenCalledTimes(1);
	});

	it("confirms deletion via Enter or Space key on the Delete confirmation button", async () => {
		const user = userEvent.setup();
		const onDelete = mock(() => {});

		const { rerender } = renderPlaylistItemRow({
			item: sampleItem,
			isFirst: true,
			isLast: false,
			isSelected: true,
			mode: "edit",
			onSelect: () => {},
			onMoveUp: () => {},
			onMoveDown: () => {},
			onDelete: onDelete,
		});

		const deleteBtn = screen.getByRole("button", { name: "Delete item" });
		await user.click(deleteBtn);

		const confirmBtn = screen.getByRole("button", { name: "Delete" });
		const cancelBtn = screen.getByRole("button", { name: "Cancel" });
		await waitFor(() => expect(cancelBtn).toHaveFocus());

		// Tab to Delete button
		await user.keyboard("{Tab}");
		expect(confirmBtn).toHaveFocus();

		// Actuate via Enter
		await user.keyboard("{Enter}");
		expect(onDelete).toHaveBeenCalledTimes(1);

		// Render fresh row and actuate via Space
		rerender(
			// biome-ignore lint/a11y/useSemanticElements: APG Composite Grid
			<div role="grid" aria-label="Playlist items">
				<PlaylistItemRow
					item={sampleItem}
					isFirst={true}
					isLast={false}
					isSelected={true}
					mode="edit"
					onSelect={() => {}}
					onMoveUp={() => {}}
					onMoveDown={() => {}}
					onDelete={onDelete}
				/>
			</div>,
		);

		const newDeleteBtn = screen.getByRole("button", { name: "Delete item" });
		await user.click(newDeleteBtn);

		const newCancelBtn = screen.getByRole("button", { name: "Cancel" });
		const newConfirmBtn = screen.getByRole("button", { name: "Delete" });
		await waitFor(() => expect(newCancelBtn).toHaveFocus());

		await user.keyboard("{Tab}");
		expect(newConfirmBtn).toHaveFocus();
		await user.keyboard(" ");
		expect(onDelete).toHaveBeenCalledTimes(2);
	});

	it("opens delete confirmation when Backspace or Delete key is pressed on the row", async () => {
		const user = userEvent.setup();

		renderPlaylistItemRow({
			item: sampleItem,
			isFirst: true,
			isLast: false,
			isSelected: true,
			mode: "edit",
			onSelect: () => {},
			onMoveUp: () => {},
			onMoveDown: () => {},
			onDelete: () => {},
		});

		const row = screen.getByRole("row");
		row.focus();

		await user.keyboard("{Delete}");
		expect(screen.getByText("Delete this item?")).toBeInTheDocument();

		const cancelBtn = screen.getByRole("button", { name: "Cancel" });
		await waitFor(() => expect(cancelBtn).toHaveFocus());
		await user.click(cancelBtn);

		// Should close
		expect(screen.queryByText("Delete this item?")).not.toBeInTheDocument();
	});

	it("opens delete confirmation when Backspace or Delete key is pressed on the row in view mode", async () => {
		const user = userEvent.setup();

		renderPlaylistItemRow({
			item: sampleItem,
			isFirst: true,
			isLast: false,
			isSelected: true,
			mode: "view",
			onSelect: () => {},
			onMoveUp: () => {},
			onMoveDown: () => {},
			onDelete: () => {},
		});

		const row = screen.getByRole("row");
		row.focus();

		await user.keyboard("{Delete}");
		expect(screen.getByText("Delete this item?")).toBeInTheDocument();

		const cancelBtn = screen.getByRole("button", { name: "Cancel" });
		await waitFor(() => expect(cancelBtn).toHaveFocus());
		await user.click(cancelBtn);

		// Should close
		expect(screen.queryByText("Delete this item?")).not.toBeInTheDocument();
	});

	it("supports roving focus between row and action buttons via ArrowRight and ArrowLeft", async () => {
		const user = userEvent.setup();

		renderPlaylistItemRow({
			item: sampleItem,
			isFirst: false,
			isLast: false,
			isSelected: true,
			mode: "edit",
			onSelect: () => {},
			onMoveUp: () => {},
			onMoveDown: () => {},
			onDelete: () => {},
		});

		const row = screen.getByRole("row");
		row.focus();
		expect(document.activeElement).toBe(row);

		// ArrowRight focuses the first enabled action button (Move up)
		await user.keyboard("{ArrowRight}");
		const moveUpBtn = screen.getByRole("button", { name: "Move up" });
		expect(document.activeElement).toBe(moveUpBtn);

		// ArrowRight roves to next button (Move down)
		await user.keyboard("{ArrowRight}");
		const moveDownBtn = screen.getByRole("button", { name: "Move down" });
		expect(document.activeElement).toBe(moveDownBtn);

		// ArrowRight roves to Edit button
		await user.keyboard("{ArrowRight}");
		const editBtn = screen.getByRole("button", { name: "Edit item" });
		expect(document.activeElement).toBe(editBtn);

		// ArrowRight roves to Delete button
		await user.keyboard("{ArrowRight}");
		const deleteBtn = screen.getByRole("button", { name: "Delete item" });
		expect(document.activeElement).toBe(deleteBtn);

		// ArrowRight at end stays on Delete button
		await user.keyboard("{ArrowRight}");
		expect(document.activeElement).toBe(deleteBtn);

		// ArrowLeft roves backwards
		await user.keyboard("{ArrowLeft}");
		expect(document.activeElement).toBe(editBtn);

		await user.keyboard("{ArrowLeft}");
		expect(document.activeElement).toBe(moveDownBtn);

		await user.keyboard("{ArrowLeft}");
		expect(document.activeElement).toBe(moveUpBtn);

		// ArrowLeft from first enabled action button returns focus to the row
		await user.keyboard("{ArrowLeft}");
		expect(document.activeElement).toBe(row);
	});

	it("skips disabled buttons when roving with ArrowRight on boundary row (index 0)", async () => {
		const user = userEvent.setup();

		renderPlaylistItemRow({
			item: sampleItem,
			isFirst: true,
			isLast: false,
			isSelected: true,
			mode: "edit",
			onSelect: () => {},
			onMoveUp: () => {},
			onMoveDown: () => {},
			onDelete: () => {},
		});

		const row = screen.getByRole("row");
		row.focus();

		// ArrowRight on index 0 should focus Move down since Move up is disabled
		await user.keyboard("{ArrowRight}");
		const moveDownBtn = screen.getByRole("button", { name: "Move down" });
		expect(document.activeElement).toBe(moveDownBtn);

		// ArrowLeft should return directly to row
		await user.keyboard("{ArrowLeft}");
		expect(document.activeElement).toBe(row);
	});

	it("pressing Escape while focused on an action button returns focus to the row", async () => {
		const user = userEvent.setup();

		renderPlaylistItemRow({
			item: sampleItem,
			isFirst: false,
			isLast: false,
			isSelected: true,
			mode: "edit",
			onSelect: () => {},
			onMoveUp: () => {},
			onMoveDown: () => {},
			onDelete: () => {},
		});

		const row = screen.getByRole("row");
		row.focus();

		await user.keyboard("{ArrowRight}");
		const moveUpBtn = screen.getByRole("button", { name: "Move up" });
		expect(document.activeElement).toBe(moveUpBtn);

		await user.keyboard("{Escape}");
		expect(document.activeElement).toBe(row);
	});

	it("ensures no button is nested inside another button or role='button' and trigger renders directly onto the button", () => {
		renderPlaylistItemRow({
			item: sampleItem,
			isFirst: true,
			isLast: false,
			isSelected: false,
			mode: "edit",
			onSelect: () => {},
			onMoveUp: () => {},
			onMoveDown: () => {},
			onDelete: () => {},
		});

		// Check all buttons in the row
		const row = screen.getByRole("row");
		const buttons = within(row).getAllByRole("button");
		expect(buttons.length).toBe(4);

		for (const button of buttons) {
			// Ensure button is not inside another button
			expect(button.closest("button") === button).toBe(true);
			const parentRoleButton = button.parentElement?.closest("[role='button']");
			expect(parentRoleButton).toBeNull();
		}

		// Delete button specific check: direct single button
		const deleteBtn = within(row).getByRole("button", { name: "Delete item" });
		expect(deleteBtn.tagName).toBe("BUTTON");
		expect(deleteBtn.parentElement?.getAttribute("role")).not.toBe("button");
		expect(deleteBtn.parentElement?.tagName).not.toBe("SPAN");
	});

	it("renders delete confirmation popover with alertdialog semantics, initial Cancel focus, and focus restoration upon Escape", async () => {
		const user = userEvent.setup();

		renderPlaylistItemRow({
			item: sampleItem,
			isFirst: true,
			isLast: false,
			isSelected: true,
			mode: "edit",
			onSelect: () => {},
			onMoveUp: () => {},
			onMoveDown: () => {},
			onDelete: () => {},
		});

		const deleteBtn = screen.getByRole("button", { name: "Delete item" });
		await user.click(deleteBtn);

		// Popover container should have role="alertdialog"
		const alertdialog = screen.getByRole("alertdialog");
		expect(alertdialog).toBeInTheDocument();
		expect(screen.getByText("Delete this item?")).toBeInTheDocument();

		const cancelBtn = screen.getByRole("button", { name: "Cancel" });
		expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();

		// Verify initial autofocus on Cancel button
		await waitFor(() => expect(cancelBtn).toHaveFocus());

		// Press Escape -> dismisses popover and restores focus to trigger button
		await user.keyboard("{Escape}");
		expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
		expect(deleteBtn).toHaveFocus();
	});

	it("restores focus to originating row when Escape dismisses delete popover in view mode", async () => {
		const user = userEvent.setup();

		renderPlaylistItemRow({
			item: sampleItem,
			isFirst: true,
			isLast: false,
			isSelected: true,
			mode: "view",
			onSelect: () => {},
			onMoveUp: () => {},
			onMoveDown: () => {},
			onDelete: () => {},
		});

		const row = screen.getByRole("row");
		row.focus();
		expect(row).toHaveFocus();

		// Trigger delete confirmation via Delete key in view mode
		await user.keyboard("{Delete}");
		expect(screen.getByRole("alertdialog")).toBeInTheDocument();
		const cancelBtn = screen.getByRole("button", { name: "Cancel" });
		await waitFor(() => expect(cancelBtn).toHaveFocus());

		// Dismiss via Escape
		await user.keyboard("{Escape}");
		expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
		expect(row).toHaveFocus();
	});
});
