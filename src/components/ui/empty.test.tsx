import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "./empty";

describe("Empty primitive components", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders Empty container with children and custom class", () => {
		render(
			<Empty data-testid="empty-root" className="custom-root">
				<span>Child</span>
			</Empty>,
		);

		const el = screen.getByTestId("empty-root");
		expect(el).toBeInTheDocument();
		expect(el).toHaveAttribute("data-slot", "empty");
		expect(el).toHaveClass("custom-root");
		expect(el).toHaveTextContent("Child");
	});

	it("renders EmptyHeader with children and custom class", () => {
		render(
			<EmptyHeader data-testid="empty-header" className="custom-header">
				<span>Header Content</span>
			</EmptyHeader>,
		);

		const el = screen.getByTestId("empty-header");
		expect(el).toBeInTheDocument();
		expect(el).toHaveAttribute("data-slot", "empty-header");
		expect(el).toHaveClass("custom-header");
		expect(el).toHaveTextContent("Header Content");
	});

	it("renders EmptyMedia with default and icon variants", () => {
		const { rerender } = render(
			<EmptyMedia data-testid="empty-media">
				<span>Media</span>
			</EmptyMedia>,
		);

		let el = screen.getByTestId("empty-media");
		expect(el).toHaveAttribute("data-slot", "empty-icon");
		expect(el).toHaveAttribute("data-variant", "default");

		rerender(
			<EmptyMedia data-testid="empty-media" variant="icon">
				<span>Media</span>
			</EmptyMedia>,
		);

		el = screen.getByTestId("empty-media");
		expect(el).toHaveAttribute("data-variant", "icon");
	});

	it("renders EmptyTitle as an accessible heading tag h3", () => {
		render(<EmptyTitle>Test Title</EmptyTitle>);

		const heading = screen.getByRole("heading", {
			level: 3,
			name: "Test Title",
		});
		expect(heading).toBeInTheDocument();
		expect(heading.tagName).toBe("H3");
		expect(heading).toHaveAttribute("data-slot", "empty-title");
	});

	it("renders EmptyDescription as paragraph", () => {
		render(<EmptyDescription>Test Description</EmptyDescription>);

		const desc = screen.getByText("Test Description");
		expect(desc).toBeInTheDocument();
		expect(desc.tagName).toBe("P");
		expect(desc).toHaveAttribute("data-slot", "empty-description");
	});

	it("renders EmptyContent with children", () => {
		render(
			<EmptyContent data-testid="empty-content">
				<button type="button">Action</button>
			</EmptyContent>,
		);

		const content = screen.getByTestId("empty-content");
		expect(content).toBeInTheDocument();
		expect(content).toHaveAttribute("data-slot", "empty-content");
		expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
	});
});
