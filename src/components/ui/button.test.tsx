import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./button";

describe("Button component", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders button correctly with accessible role", () => {
		render(<Button>Click me</Button>);
		const button = screen.getByRole("button", { name: "Click me" });
		expect(button).toBeInTheDocument();
	});

	it("renders destructive variant correctly with accessible role", () => {
		render(<Button variant="destructive">Delete</Button>);
		const button = screen.getByRole("button", { name: "Delete" });
		expect(button).toBeInTheDocument();
	});

	it("handles keyboard focus via tab navigation", async () => {
		const user = userEvent.setup();
		render(
			<div>
				<Button>First</Button>
				<Button>Second</Button>
			</div>,
		);

		const firstButton = screen.getByRole("button", { name: "First" });
		const secondButton = screen.getByRole("button", { name: "Second" });

		expect(firstButton).not.toHaveFocus();
		expect(secondButton).not.toHaveFocus();

		await user.tab();
		expect(firstButton).toHaveFocus();

		await user.tab();
		expect(secondButton).toHaveFocus();
	});

	it("handles click interaction properly", async () => {
		const user = userEvent.setup();
		let clicked = false;
		render(<Button onClick={() => (clicked = true)}>Action</Button>);

		const button = screen.getByRole("button", { name: "Action" });
		await user.click(button);

		expect(clicked).toBe(true);
		expect(button).toHaveFocus();
	});
});
