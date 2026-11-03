import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { PreviewCanvas } from "./preview-canvas";

describe("PreviewCanvas", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders blank screen indicator when text is null", () => {
		render(<PreviewCanvas text={null} />);

		const canvas = screen.getByRole("region", { name: "Preview canvas" });
		expect(canvas).toBeInTheDocument();
		expect(screen.getByText("Blank screen")).toBeInTheDocument();
		expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
	});

	it("renders blank screen indicator when text is whitespace only", () => {
		render(<PreviewCanvas text="   " />);

		const canvas = screen.getByRole("region", { name: "Preview canvas" });
		expect(canvas).toBeInTheDocument();
		expect(screen.getByText("Blank screen")).toBeInTheDocument();
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
		expect(textElement).toBeInTheDocument();
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
		expect(canvas).toBeInTheDocument();
	});

	it("suppresses text and renders Clear badge when isClear is true", () => {
		render(<PreviewCanvas text="Amazing Grace" isClear={true} />);

		const canvas = screen.getByRole("region", { name: "Preview canvas" });
		expect(canvas).toBeInTheDocument();
		expect(canvas).not.toHaveTextContent("Amazing Grace");
		expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
		expect(screen.getByText("Output text is cleared")).toBeInTheDocument();

		const badge = screen.getByText("Clear");
		expect(badge).toBeInTheDocument();
		expect(badge).toHaveAttribute("aria-hidden", "true");
		const icon = badge.querySelector("svg");
		expect(icon).toBeInTheDocument();
		expect(icon).toHaveClass("tabler-icon-eraser");
		expect(screen.queryByText("CLEAR")).not.toBeInTheDocument();
		expect(screen.queryByText("Blackout")).not.toBeInTheDocument();
		expect(screen.queryByText("BLACKOUT")).not.toBeInTheDocument();
	});

	it("suppresses text and renders Blackout badge when isBlackout is true", () => {
		render(<PreviewCanvas text="Amazing Grace" isBlackout={true} />);

		const canvas = screen.getByRole("region", { name: "Preview canvas" });
		expect(canvas).toBeInTheDocument();
		expect(canvas).not.toHaveTextContent("Amazing Grace");
		expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
		expect(screen.getByText("Output is blacked out")).toBeInTheDocument();

		const badge = screen.getByText("Blackout");
		expect(badge).toBeInTheDocument();
		expect(badge).toHaveAttribute("aria-hidden", "true");
		const icon = badge.querySelector("svg");
		expect(icon).toBeInTheDocument();
		expect(icon).toHaveClass("tabler-icon-eye-off");
		expect(screen.queryByText("BLACKOUT")).not.toBeInTheDocument();
		expect(screen.queryByText("Clear")).not.toBeInTheDocument();
		expect(screen.queryByText("CLEAR")).not.toBeInTheDocument();
	});

	it("gives blackout badge precedence over clear badge when both are true", () => {
		render(
			<PreviewCanvas text="Amazing Grace" isClear={true} isBlackout={true} />,
		);

		const canvas = screen.getByRole("region", { name: "Preview canvas" });
		expect(canvas).not.toHaveTextContent("Amazing Grace");
		expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
		expect(screen.getByText("Output is blacked out")).toBeInTheDocument();
		expect(
			screen.queryByText("Output text is cleared"),
		).not.toBeInTheDocument();

		const badge = screen.getByText("Blackout");
		expect(badge).toBeInTheDocument();
		expect(badge).toHaveAttribute("aria-hidden", "true");
		expect(screen.queryByText("Clear")).not.toBeInTheDocument();
		expect(screen.queryByText("CLEAR")).not.toBeInTheDocument();
		expect(screen.queryByText("BLACKOUT")).not.toBeInTheDocument();
	});

	it("renders no badge when neither isClear nor isBlackout is true", () => {
		render(
			<PreviewCanvas text="Amazing Grace" isClear={false} isBlackout={false} />,
		);

		expect(screen.getByText("Amazing Grace")).toBeInTheDocument();
		expect(screen.queryByText("Clear")).not.toBeInTheDocument();
		expect(screen.queryByText("CLEAR")).not.toBeInTheDocument();
		expect(screen.queryByText("Blackout")).not.toBeInTheDocument();
		expect(screen.queryByText("BLACKOUT")).not.toBeInTheDocument();
	});
});
