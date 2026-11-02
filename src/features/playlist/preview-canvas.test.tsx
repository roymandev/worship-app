import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { PreviewCanvas } from "./preview-canvas";

describe("PreviewCanvas", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders blank screen indicator with sr-only when text is null", () => {
		render(<PreviewCanvas text={null} />);

		const canvas = screen.getByRole("region", { name: "Preview canvas" });
		expect(canvas).toBeInTheDocument();
		const srElement = screen.getByText("Blank screen");
		expect(srElement).toBeInTheDocument();
		expect(srElement).toHaveClass("sr-only");
		expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
	});

	it("renders blank screen indicator when text is whitespace only", () => {
		render(<PreviewCanvas text="   " />);

		const canvas = screen.getByRole("region", { name: "Preview canvas" });
		expect(canvas).toBeInTheDocument();
		const srElement = screen.getByText("Blank screen");
		expect(srElement).toBeInTheDocument();
		expect(srElement).toHaveClass("sr-only");
		expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
	});

	it("renders text and preserves whitespace without blank screen indicator", () => {
		const sampleText = "Verse 1 line 1\nVerse 1 line 2\n\nChorus line";
		render(<PreviewCanvas text={sampleText} />);

		const canvas = screen.getByRole("region", { name: "Preview canvas" });
		expect(canvas).toHaveTextContent("Verse 1 line 1");
		const textElement = screen.getByText((content) =>
			content.includes("Verse 1 line 1"),
		);
		expect(textElement).toHaveClass("whitespace-pre-wrap");
		expect(textElement.textContent).toBe(sampleText);
		expect(screen.queryByText("Blank screen")).not.toBeInTheDocument();
	});

	it("sets data-variant attribute properly for stage and live", () => {
		const { rerender } = render(
			<PreviewCanvas text="Sample" variant="stage" />,
		);
		let canvas = screen.getByRole("region", { name: "Preview canvas" });
		expect(canvas).toHaveAttribute("data-variant", "stage");

		rerender(<PreviewCanvas text="Sample" variant="live" />);
		canvas = screen.getByRole("region", { name: "Live preview canvas" });
		expect(canvas).toHaveAttribute("data-variant", "live");
	});

	it("applies custom className", () => {
		render(<PreviewCanvas text="Sample" className="custom-canvas" />);
		const canvas = screen.getByRole("region", { name: "Preview canvas" });
		expect(canvas).toHaveClass("custom-canvas");
	});
});
