import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { Textarea } from "./textarea";

describe("Textarea component", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders a textarea element", () => {
		render(<Textarea placeholder="Enter lyrics" />);
		const textarea = screen.getByRole("textbox");
		expect(textarea).toBeInTheDocument();
		expect(textarea).toHaveAttribute("placeholder", "Enter lyrics");
	});

	it("forwards ref in React 19 without forwardRef wrapper", () => {
		const ref = createRef<HTMLTextAreaElement>();
		render(<Textarea ref={ref} placeholder="With ref" />);
		expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
	});

	it("handles user multiline typing and change events", async () => {
		const user = userEvent.setup();
		render(<Textarea placeholder="Type lyrics" />);
		const textarea = screen.getByPlaceholderText("Type lyrics");

		await user.type(textarea, "Line 1{enter}Line 2");
		expect(textarea).toHaveValue("Line 1\nLine 2");
	});

	it("handles disabled state properly", () => {
		render(<Textarea placeholder="Disabled" disabled />);
		const textarea = screen.getByPlaceholderText("Disabled");
		expect(textarea).toBeDisabled();
	});

	it("renders aria-invalid attribute when invalid", () => {
		render(<Textarea placeholder="Invalid" aria-invalid="true" />);
		const textarea = screen.getByRole("textbox");
		expect(textarea).toBeInvalid();
	});
});
