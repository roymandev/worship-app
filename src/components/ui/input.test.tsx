import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { Input } from "./input";

describe("Input component", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders an input element with default type text", () => {
		render(<Input placeholder="Enter title" />);
		const input = screen.getByRole("textbox");
		expect(input).toBeInTheDocument();
		expect(input).toHaveAttribute("type", "text");
		expect(input).toHaveAttribute("placeholder", "Enter title");
	});

	it("forwards ref in React 19 without forwardRef wrapper", () => {
		const ref = createRef<HTMLInputElement>();
		render(<Input ref={ref} placeholder="With ref" />);
		expect(ref.current).toBeInstanceOf(HTMLInputElement);
	});

	it("handles user typing and change events", async () => {
		const user = userEvent.setup();
		render(<Input placeholder="Type here" />);
		const input = screen.getByPlaceholderText("Type here");

		await user.type(input, "Amazing Grace");
		expect(input).toHaveValue("Amazing Grace");
	});

	it("handles disabled state properly", () => {
		render(<Input placeholder="Disabled" disabled />);
		const input = screen.getByPlaceholderText("Disabled");
		expect(input).toBeDisabled();
	});

	it("renders aria-invalid attribute when invalid", () => {
		render(<Input placeholder="Invalid" aria-invalid="true" />);
		const input = screen.getByRole("textbox");
		expect(input).toBeInvalid();
	});
});
