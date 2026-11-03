import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Slider } from "./slider";

describe("Slider component", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders slider input with role='slider' and default value attributes", () => {
		const { container } = render(
			<Slider defaultValue={50} aria-label="Volume" />,
		);
		const input = container.querySelector<HTMLInputElement>(
			'input[type="range"]',
		);
		expect(input).not.toBeNull();
		expect(input).toHaveAttribute("aria-valuenow", "50");
		expect(input).toHaveAttribute("min", "0");
		expect(input).toHaveAttribute("max", "100");
		expect(input?.value).toBe("50");
	});

	it("renders with custom value and min/max boundaries", () => {
		const { container } = render(
			<Slider value={75} min={10} max={90} aria-label="Brightness" />,
		);
		const input = container.querySelector<HTMLInputElement>(
			'input[type="range"]',
		);
		expect(input).not.toBeNull();
		expect(input).toHaveAttribute("aria-valuenow", "75");
		expect(input).toHaveAttribute("min", "10");
		expect(input).toHaveAttribute("max", "90");
		expect(input?.value).toBe("75");
	});

	it("handles keyboard navigation and change events", async () => {
		const user = userEvent.setup();
		const { container } = render(
			<Slider defaultValue={50} aria-label="Level" />,
		);
		const input = container.querySelector<HTMLInputElement>(
			'input[type="range"]',
		);
		expect(input).not.toBeNull();

		input?.focus();
		expect(input).toHaveFocus();

		await user.keyboard("{ArrowRight}");
		expect(Number(input?.value)).toBeGreaterThan(50);

		await user.keyboard("{ArrowLeft}");
		expect(Number(input?.value)).toBe(50);
	});

	it("respects disabled state", () => {
		const { container } = render(
			<Slider defaultValue={50} disabled aria-label="Disabled Slider" />,
		);
		const input = container.querySelector<HTMLInputElement>(
			'input[type="range"]',
		);
		expect(input).not.toBeNull();
		expect(input).toBeDisabled();
	});

	it("renders thumb with focus-ring class for accessibility compliance", () => {
		const { container } = render(
			<Slider defaultValue={50} aria-label="Level" />,
		);
		const thumb = container.querySelector('[data-slot="slider-thumb"]');
		expect(thumb).not.toBeNull();
		expect(thumb).toHaveClass("focus-ring");
	});
});
