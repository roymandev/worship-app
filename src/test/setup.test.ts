import { describe, expect, it } from "bun:test";

describe("toHaveFocus custom matcher", () => {
	it("correctly identifies focused and unfocused elements", () => {
		const button = document.createElement("button");
		button.setAttribute("data-testid", "test-btn");
		button.setAttribute("role", "button");
		button.setAttribute("aria-label", "Test Action");
		document.body.appendChild(button);

		expect(button).not.toHaveFocus();

		button.focus();
		expect(button).toHaveFocus();

		button.blur();
		expect(button).not.toHaveFocus();

		button.remove();
	});

	it("formats failure messages cleanly without deep serialization", () => {
		const button = document.createElement("button");
		button.setAttribute("data-testid", "submit-btn");
		button.className = "btn-primary";
		document.body.appendChild(button);

		try {
			expect(button).toHaveFocus();
			expect(true).toBe(false); // Should not reach here
		} catch (error) {
			const msg = (error as Error).message;
			expect(msg).toContain("expected element to have focus: <button");
			expect(msg).toContain('data-testid="submit-btn"');
			expect(msg).toContain("received: <body");
		} finally {
			button.remove();
		}
	});

	it("safely handles null and non-element inputs in failure reporting", () => {
		try {
			expect(null).toHaveFocus();
			expect(true).toBe(false);
		} catch (error) {
			const msg = (error as Error).message;
			expect(msg).toContain("expected element to have focus: null");
			expect(msg).toContain("received: <body");
		}

		try {
			expect(undefined).toHaveFocus();
			expect(true).toBe(false);
		} catch (error) {
			const msg = (error as Error).message;
			expect(msg).toContain("expected element to have focus: undefined");
		}
	});
});
