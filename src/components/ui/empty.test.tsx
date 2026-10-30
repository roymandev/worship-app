import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { EmptyState } from "./empty";

describe("EmptyState component", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders title, description, icon, and action", () => {
		render(
			<EmptyState
				className="custom-empty"
				icon={<span data-testid="test-icon">Icon</span>}
				title="No items found"
				description="Try adjusting your search criteria."
				action={<button type="button">Create item</button>}
			/>,
		);

		const root = screen
			.getByText("No items found")
			.closest('[data-slot="empty"]');
		expect(root).toBeInTheDocument();
		expect(root).toHaveClass("custom-empty");

		const icon = screen.getByTestId("test-icon");
		expect(icon).toBeInTheDocument();

		const heading = screen.getByRole("heading", {
			level: 3,
			name: "No items found",
		});
		expect(heading).toBeInTheDocument();
		expect(heading).toHaveAttribute("data-slot", "empty-title");

		const description = screen.getByText("Try adjusting your search criteria.");
		expect(description).toBeInTheDocument();
		expect(description.tagName).toBe("P");
		expect(description).toHaveAttribute("data-slot", "empty-description");

		const actionBtn = screen.getByRole("button", { name: "Create item" });
		expect(actionBtn).toBeInTheDocument();
	});

	it("renders minimally with only title", () => {
		render(<EmptyState title="Simple Title" />);

		const heading = screen.getByRole("heading", {
			level: 3,
			name: "Simple Title",
		});
		expect(heading).toBeInTheDocument();
		expect(screen.queryByRole("button")).toBeNull();
	});

	it("supports ReactNode for title, description, and startSlot", () => {
		render(
			<EmptyState
				startSlot={<span data-testid="start-slot-icon">Start</span>}
				title={<span>Rich Title</span>}
				description={<span>Rich Description</span>}
			/>,
		);

		expect(screen.getByTestId("start-slot-icon")).toBeInTheDocument();
		expect(screen.getByText("Rich Title")).toBeInTheDocument();
		expect(screen.getByText("Rich Description")).toBeInTheDocument();
	});
});
