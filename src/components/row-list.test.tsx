import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { RowList } from "./row-list";

interface TestItem {
	id: string;
	title: string;
}

const mockItems: TestItem[] = [
	{ id: "1", title: "First Item" },
	{ id: "2", title: "Second Item" },
	{ id: "3", title: "Third Item" },
];

describe("RowList Component", () => {
	let originalScrollIntoView: typeof window.HTMLElement.prototype.scrollIntoView;

	beforeEach(() => {
		originalScrollIntoView = window.HTMLElement.prototype.scrollIntoView;
	});

	afterEach(() => {
		cleanup();
		if (originalScrollIntoView !== undefined) {
			window.HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
		}
	});

	it("renders rows with composite roving tabindex (exactly one active row gets tabIndex=0, others -1)", () => {
		render(
			<RowList
				items={mockItems}
				selectedId="2"
				onSelect={() => {}}
				getKey={(item) => item.id}
				ariaLabel="Test List"
				renderRow={(item) => <div>{item.title}</div>}
			/>,
		);

		const grid = screen.getByRole("grid", { name: "Test List" });
		expect(grid).toBeInTheDocument();
		expect(grid).toHaveAttribute("tabindex", "-1");

		const rows = screen.getAllByRole("row");
		expect(rows).toHaveLength(3);
		expect(rows[0]).toHaveAttribute("tabindex", "-1");
		expect(rows[0]).toHaveAttribute("aria-selected", "false");
		expect(rows[1]).toHaveAttribute("tabindex", "0");
		expect(rows[1]).toHaveAttribute("aria-selected", "true");
		expect(rows[2]).toHaveAttribute("tabindex", "-1");
		expect(rows[2]).toHaveAttribute("aria-selected", "false");
	});

	it("defaults tabIndex=0 to the first row if selectedId is null or not found", () => {
		render(
			<RowList
				items={mockItems}
				selectedId={null}
				onSelect={() => {}}
				getKey={(item) => item.id}
				ariaLabel="Test List"
				renderRow={(item) => <div>{item.title}</div>}
			/>,
		);

		const rows = screen.getAllByRole("row");
		expect(rows[0]).toHaveAttribute("tabindex", "0");
		expect(rows[0]).toHaveAttribute("aria-selected", "false");
		expect(rows[1]).toHaveAttribute("tabindex", "-1");
		expect(rows[2]).toHaveAttribute("tabindex", "-1");
	});

	it("navigates with ArrowDown and ArrowUp and triggers onSelect", async () => {
		const user = userEvent.setup();
		const handleSelect = mock();

		function TestWrapper() {
			const [selectedId, setSelectedId] = useState<string | null>("1");
			return (
				<RowList
					items={mockItems}
					selectedId={selectedId}
					onSelect={(item) => {
						handleSelect(item);
						setSelectedId(item.id);
					}}
					getKey={(item) => item.id}
					ariaLabel="Test List"
					renderRow={(item) => <div>{item.title}</div>}
				/>
			);
		}

		render(<TestWrapper />);

		const rows = screen.getAllByRole("row");
		rows[0].focus();
		expect(rows[0]).toHaveFocus();

		await user.keyboard("{ArrowDown}");
		expect(handleSelect).toHaveBeenCalledWith(mockItems[1]);
		expect(rows[1]).toHaveFocus();
		expect(rows[1]).toHaveAttribute("tabindex", "0");
		expect(rows[0]).toHaveAttribute("tabindex", "-1");

		await user.keyboard("{ArrowDown}");
		expect(handleSelect).toHaveBeenCalledWith(mockItems[2]);
		expect(rows[2]).toHaveFocus();

		// ArrowUp moves back
		await user.keyboard("{ArrowUp}");
		expect(handleSelect).toHaveBeenCalledWith(mockItems[1]);
		expect(rows[1]).toHaveFocus();
	});

	it("clamps navigation at boundaries (ArrowUp at first item, ArrowDown at last item)", async () => {
		const user = userEvent.setup();
		const handleSelect = mock();

		function TestWrapper() {
			const [selectedId, setSelectedId] = useState<string | null>("1");
			return (
				<RowList
					items={mockItems}
					selectedId={selectedId}
					onSelect={(item) => {
						handleSelect(item);
						setSelectedId(item.id);
					}}
					getKey={(item) => item.id}
					ariaLabel="Test List"
					renderRow={(item) => <div>{item.title}</div>}
				/>
			);
		}

		render(<TestWrapper />);

		const rows = screen.getAllByRole("row");
		rows[0].focus();

		// ArrowUp on first item clamps at first item
		handleSelect.mockClear();
		await user.keyboard("{ArrowUp}");
		expect(handleSelect).toHaveBeenCalledWith(mockItems[0]);
		expect(rows[0]).toHaveFocus();

		// Move to end
		await user.keyboard("{ArrowDown}");
		await user.keyboard("{ArrowDown}");
		expect(rows[2]).toHaveFocus();

		// ArrowDown on last item clamps at last item
		handleSelect.mockClear();
		await user.keyboard("{ArrowDown}");
		expect(handleSelect).toHaveBeenCalledWith(mockItems[2]);
		expect(rows[2]).toHaveFocus();
	});

	it("supports Home and End key navigation", async () => {
		const user = userEvent.setup();
		const handleSelect = mock();

		function TestWrapper() {
			const [selectedId, setSelectedId] = useState<string | null>("2");
			return (
				<RowList
					items={mockItems}
					selectedId={selectedId}
					onSelect={(item) => {
						handleSelect(item);
						setSelectedId(item.id);
					}}
					getKey={(item) => item.id}
					ariaLabel="Test List"
					renderRow={(item) => <div>{item.title}</div>}
				/>
			);
		}

		render(<TestWrapper />);

		const rows = screen.getAllByRole("row");
		rows[1].focus();

		// Home jumps to first item
		await user.keyboard("{Home}");
		expect(handleSelect).toHaveBeenCalledWith(mockItems[0]);
		expect(rows[0]).toHaveFocus();

		// End jumps to last item
		await user.keyboard("{End}");
		expect(handleSelect).toHaveBeenCalledWith(mockItems[2]);
		expect(rows[2]).toHaveFocus();
	});

	it("scrolls focused item into view when active item changes", () => {
		const scrollMock = mock();
		window.HTMLElement.prototype.scrollIntoView = scrollMock;

		const { rerender } = render(
			<RowList
				items={mockItems}
				selectedId="1"
				onSelect={() => {}}
				getKey={(item) => item.id}
				ariaLabel="Test List"
				renderRow={(item) => <div>{item.title}</div>}
			/>,
		);

		expect(scrollMock).toHaveBeenCalledWith({
			block: "nearest",
			behavior: "smooth",
		});
		scrollMock.mockClear();

		rerender(
			<RowList
				items={mockItems}
				selectedId="2"
				onSelect={() => {}}
				getKey={(item) => item.id}
				ariaLabel="Test List"
				renderRow={(item) => <div>{item.title}</div>}
			/>,
		);

		expect(scrollMock).toHaveBeenCalledWith({
			block: "nearest",
			behavior: "smooth",
		});
	});

	it("handles mouse click selection", async () => {
		const user = userEvent.setup();
		const handleSelect = mock();

		render(
			<RowList
				items={mockItems}
				selectedId="1"
				onSelect={handleSelect}
				getKey={(item) => item.id}
				ariaLabel="Test List"
				renderRow={(item) => <div>{item.title}</div>}
			/>,
		);

		const rows = screen.getAllByRole("row");
		await user.click(rows[2]);

		expect(handleSelect).toHaveBeenCalledWith(mockItems[2]);
	});

	it("allows Tab and Shift+Tab to exit the composite without stopping at sibling rows", async () => {
		const user = userEvent.setup();

		render(
			<div>
				<button type="button">Before Button</button>
				<RowList
					items={mockItems}
					selectedId="2"
					onSelect={() => {}}
					getKey={(item) => item.id}
					ariaLabel="Test List"
					renderRow={(item) => <div>{item.title}</div>}
				/>
				<button type="button">After Button</button>
			</div>,
		);

		const beforeBtn = screen.getByRole("button", { name: "Before Button" });
		const afterBtn = screen.getByRole("button", { name: "After Button" });
		const rows = screen.getAllByRole("row");

		// Initial focus on before button
		beforeBtn.focus();
		expect(beforeBtn).toHaveFocus();

		// Tab into RowList lands directly on active row (row index 1 with tabIndex=0)
		await user.tab();
		expect(rows[1]).toHaveFocus();

		// Next Tab exits immediately to after button, skipping sibling rows (index 2)
		await user.tab();
		expect(afterBtn).toHaveFocus();

		// Shift+Tab back lands on active row
		await user.tab({ shift: true });
		expect(rows[1]).toHaveFocus();

		// Shift+Tab again exits directly to before button, skipping sibling row (index 0)
		await user.tab({ shift: true });
		expect(beforeBtn).toHaveFocus();
	});

	it("handles empty items gracefully", () => {
		render(
			<RowList
				items={[]}
				selectedId={null}
				onSelect={() => {}}
				getKey={(item: TestItem) => item.id}
				ariaLabel="Empty List"
				renderRow={(item) => <div>{item.title}</div>}
			/>,
		);

		const grid = screen.getByRole("grid", { name: "Empty List" });
		expect(grid).toBeInTheDocument();
		expect(screen.queryAllByRole("row")).toHaveLength(0);
	});
});
