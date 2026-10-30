import { afterEach, describe, expect, it, mock } from "bun:test";
import {
	cleanup,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlaylistItemRow } from "./item-row";
import type { PlaylistItem } from "./store";

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
		render(
			<PlaylistItemRow
				item={sampleItem}
				index={0}
				totalCount={3}
				isSelected={true}
				mode="view"
				onSelect={() => {}}
				onMoveUp={() => {}}
				onMoveDown={() => {}}
				onDelete={() => {}}
			/>,
		);

		const row = screen.getByRole("row");
		expect(row).toBeInTheDocument();
		expect(row).toHaveAttribute("tabindex", "0");
		expect(screen.getByText("Amazing Grace")).toBeInTheDocument();

		const goLiveBtn = screen.getByRole("button", { name: "Go Live" });
		expect(goLiveBtn).toBeInTheDocument();
		expect(goLiveBtn).toHaveAttribute("tabindex", "-1");
	});

	it("renders row in edit mode with Move Up (disabled on 1st), Move Down, Edit, Delete", () => {
		render(
			<PlaylistItemRow
				item={sampleItem}
				index={0}
				totalCount={3}
				isSelected={false}
				mode="edit"
				onSelect={() => {}}
				onMoveUp={() => {}}
				onMoveDown={() => {}}
				onDelete={() => {}}
			/>,
		);

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
		render(
			<PlaylistItemRow
				item={sampleItem}
				index={2}
				totalCount={3}
				isSelected={false}
				mode="edit"
				onSelect={() => {}}
				onMoveUp={() => {}}
				onMoveDown={() => {}}
				onDelete={() => {}}
			/>,
		);

		const moveUpBtn = screen.getByRole("button", { name: "Move up" });
		const moveDownBtn = screen.getByRole("button", { name: "Move down" });

		expect(moveUpBtn).not.toBeDisabled();
		expect(moveDownBtn).toBeDisabled();
	});

	it("calls onMoveUp and onMoveDown when clicked", async () => {
		const user = userEvent.setup();
		const onMoveUp = mock(() => {});
		const onMoveDown = mock(() => {});

		render(
			<PlaylistItemRow
				item={sampleItem}
				index={1}
				totalCount={3}
				isSelected={true}
				mode="edit"
				onSelect={() => {}}
				onMoveUp={onMoveUp}
				onMoveDown={onMoveDown}
				onDelete={() => {}}
			/>,
		);

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

		render(
			<PlaylistItemRow
				item={sampleItem}
				index={1}
				totalCount={3}
				isSelected={true}
				mode="edit"
				onSelect={() => {}}
				onMoveUp={onMoveUp}
				onMoveDown={onMoveDown}
				onDelete={() => {}}
			/>,
		);

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

		render(
			<PlaylistItemRow
				item={sampleItem}
				index={0}
				totalCount={3}
				isSelected={true}
				mode="edit"
				onSelect={() => {}}
				onMoveUp={() => {}}
				onMoveDown={() => {}}
				onDelete={onDelete}
			/>,
		);

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

	it("opens delete confirmation when Backspace or Delete key is pressed on the row", async () => {
		const user = userEvent.setup();
		const onDelete = mock(() => {});

		render(
			<PlaylistItemRow
				item={sampleItem}
				index={0}
				totalCount={3}
				isSelected={true}
				mode="edit"
				onSelect={() => {}}
				onMoveUp={() => {}}
				onMoveDown={() => {}}
				onDelete={onDelete}
			/>,
		);

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
		const onDelete = mock(() => {});

		render(
			<PlaylistItemRow
				item={sampleItem}
				index={0}
				totalCount={3}
				isSelected={true}
				mode="view"
				onSelect={() => {}}
				onMoveUp={() => {}}
				onMoveDown={() => {}}
				onDelete={onDelete}
			/>,
		);

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

		render(
			<PlaylistItemRow
				item={sampleItem}
				index={1}
				totalCount={3}
				isSelected={true}
				mode="edit"
				onSelect={() => {}}
				onMoveUp={() => {}}
				onMoveDown={() => {}}
				onDelete={() => {}}
			/>,
		);

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

		render(
			<PlaylistItemRow
				item={sampleItem}
				index={0}
				totalCount={3}
				isSelected={true}
				mode="edit"
				onSelect={() => {}}
				onMoveUp={() => {}}
				onMoveDown={() => {}}
				onDelete={() => {}}
			/>,
		);

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

		render(
			<PlaylistItemRow
				item={sampleItem}
				index={1}
				totalCount={3}
				isSelected={true}
				mode="edit"
				onSelect={() => {}}
				onMoveUp={() => {}}
				onMoveDown={() => {}}
				onDelete={() => {}}
			/>,
		);

		const row = screen.getByRole("row");
		row.focus();

		await user.keyboard("{ArrowRight}");
		const moveUpBtn = screen.getByRole("button", { name: "Move up" });
		expect(document.activeElement).toBe(moveUpBtn);

		await user.keyboard("{Escape}");
		expect(document.activeElement).toBe(row);
	});

	it("delegates ArrowDown and ArrowUp from action button to onSelectNext and onSelectPrevious", async () => {
		const user = userEvent.setup();
		const onSelectNext = mock(() => {});
		const onSelectPrevious = mock(() => {});

		render(
			<PlaylistItemRow
				item={sampleItem}
				index={1}
				totalCount={3}
				isSelected={true}
				mode="edit"
				onSelect={() => {}}
				onSelectNext={onSelectNext}
				onSelectPrevious={onSelectPrevious}
				onMoveUp={() => {}}
				onMoveDown={() => {}}
				onDelete={() => {}}
			/>,
		);

		const row = screen.getByRole("row");
		row.focus();

		await user.keyboard("{ArrowRight}");
		const moveUpBtn = screen.getByRole("button", { name: "Move up" });
		expect(document.activeElement).toBe(moveUpBtn);

		await user.keyboard("{ArrowDown}");
		expect(onSelectNext).toHaveBeenCalledTimes(1);

		await user.keyboard("{ArrowUp}");
		expect(onSelectPrevious).toHaveBeenCalledTimes(1);
	});

	it("ensures no button is nested inside another button or role='button' and trigger renders directly onto the button", () => {
		render(
			<PlaylistItemRow
				item={sampleItem}
				index={0}
				totalCount={3}
				isSelected={false}
				mode="edit"
				onSelect={() => {}}
				onMoveUp={() => {}}
				onMoveDown={() => {}}
				onDelete={() => {}}
			/>,
		);

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

	it("traps focus within delete confirmation popover with Tab and Shift+Tab cycling", async () => {
		const user = userEvent.setup();

		render(
			<PlaylistItemRow
				item={sampleItem}
				index={0}
				totalCount={3}
				isSelected={true}
				mode="edit"
				onSelect={() => {}}
				onMoveUp={() => {}}
				onMoveDown={() => {}}
				onDelete={() => {}}
			/>,
		);

		const deleteBtn = screen.getByRole("button", { name: "Delete item" });
		await user.click(deleteBtn);

		expect(screen.getByText("Delete this item?")).toBeInTheDocument();
		const cancelBtn = screen.getByRole("button", { name: "Cancel" });
		const confirmDeleteBtn = screen.getByRole("button", { name: "Delete" });

		// Verify Cancel button receives initial focus
		await waitFor(() => expect(cancelBtn).toHaveFocus());

		// Press Tab -> verify Delete button receives focus
		await user.keyboard("{Tab}");
		expect(confirmDeleteBtn).toHaveFocus();

		// Press Tab -> verify focus wraps back to Cancel button
		await user.keyboard("{Tab}");
		expect(cancelBtn).toHaveFocus();

		// Press Shift+Tab -> verify focus wraps back to Delete button
		await user.keyboard("{Shift>}{Tab}{/Shift}");
		expect(confirmDeleteBtn).toHaveFocus();

		// Press Escape -> verify popover closes and focus returns to the trigger button
		await user.keyboard("{Escape}");
		expect(screen.queryByText("Delete this item?")).not.toBeInTheDocument();
		expect(deleteBtn).toHaveFocus();
	});

	it("intercepts Shift+Tab from an action button and calls onExitToHeader", async () => {
		const user = userEvent.setup();
		const onExitToHeader = mock(() => {});

		render(
			<PlaylistItemRow
				item={sampleItem}
				index={1}
				totalCount={3}
				isSelected={true}
				mode="edit"
				onExitToHeader={onExitToHeader}
				onSelect={() => {}}
				onMoveUp={() => {}}
				onMoveDown={() => {}}
				onDelete={() => {}}
			/>,
		);

		const row = screen.getByRole("row");
		row.focus();

		// Rove to the first action button
		await user.keyboard("{ArrowRight}");
		const moveUpBtn = screen.getByRole("button", { name: "Move up" });
		expect(document.activeElement).toBe(moveUpBtn);

		// Press Shift+Tab
		await user.keyboard("{Shift>}{Tab}{/Shift}");
		expect(onExitToHeader).toHaveBeenCalledTimes(1);
	});
});
