import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import {
	BrightnessInputField,
	ColorPickerField,
	DEFAULT_PRESET_COLORS,
	isValidHexColor,
	normalizeHexColor,
} from "./color-picker-field";

function ControlledWrapper({
	initialColor = "#000000",
	onChange = mock(),
	label = "Background Color",
	disabled = false,
	inline = true,
}: {
	initialColor?: string;
	onChange?: (color: string) => void;
	label?: string;
	disabled?: boolean;
	inline?: boolean;
}) {
	const [color, setColor] = useState(initialColor);

	return (
		<ColorPickerField
			value={color}
			onChange={(nextColor) => {
				setColor(nextColor);
				onChange(nextColor);
			}}
			label={label}
			disabled={disabled}
			inline={inline}
		/>
	);
}

function BrightnessWrapper({
	initialValue = 100,
	onChange = mock(),
	label = "Brightness",
	disabled = false,
	min = 0,
	max = 100,
}: {
	initialValue?: number;
	onChange?: (val: number) => void;
	label?: string;
	disabled?: boolean;
	min?: number;
	max?: number;
}) {
	const [value, setValue] = useState(initialValue);

	return (
		<BrightnessInputField
			value={value}
			onChange={(nextVal) => {
				setValue(nextVal);
				onChange(nextVal);
			}}
			label={label}
			disabled={disabled}
			min={min}
			max={max}
		/>
	);
}

describe("ColorPickerField", () => {
	afterEach(() => {
		cleanup();
	});

	describe("utility functions", () => {
		it("validates hex color strings accurately", () => {
			expect(isValidHexColor("#fff")).toBe(true);
			expect(isValidHexColor("#ffffff")).toBe(true);
			expect(isValidHexColor("#121212")).toBe(true);
			expect(isValidHexColor("#GGG")).toBe(false);
			expect(isValidHexColor("121212")).toBe(false);
			expect(isValidHexColor("#12345")).toBe(false);
		});

		it("normalizes hex color strings", () => {
			expect(normalizeHexColor("121212")).toBe("#121212");
			expect(normalizeHexColor("#abc")).toBe("#ABC");
		});
	});

	describe("rendering and trigger", () => {
		it("renders trigger button with label, swatch, and hex value", () => {
			render(<ControlledWrapper initialColor="#000000" />);

			expect(screen.getByText("Background Color")).toBeInTheDocument();
			const trigger = screen.getByRole("button", {
				name: /Background Color: #000000/i,
			});
			expect(trigger).toBeInTheDocument();
			expect(screen.getByText("#000000")).toBeInTheDocument();
		});

		it("disables the trigger button when disabled prop is true", () => {
			render(<ControlledWrapper disabled={true} />);
			const trigger = screen.getByRole("button", {
				name: /Background Color/i,
			});
			expect(trigger).toBeDisabled();
		});
	});

	describe("popover interactions", () => {
		it("opens popover on trigger click and shows HexColorPicker, input, and presets", async () => {
			const user = userEvent.setup();
			render(<ControlledWrapper initialColor="#000000" />);

			const trigger = screen.getByRole("button", {
				name: /Background Color: #000000/i,
			});
			await user.click(trigger);

			// Popover content should now be visible
			expect(screen.getByLabelText("Hex color value")).toBeInTheDocument();
			expect(screen.getByText("Presets")).toBeInTheDocument();

			// Check that all preset swatches are rendered
			for (const preset of DEFAULT_PRESET_COLORS) {
				expect(
					screen.getByRole("button", { name: preset.name }),
				).toBeInTheDocument();
			}
		});

		it("selects a preset swatch and updates color", async () => {
			const user = userEvent.setup();
			const onChange = mock();
			render(<ControlledWrapper initialColor="#000000" onChange={onChange} />);

			const trigger = screen.getByRole("button", {
				name: /Background Color: #000000/i,
			});
			await user.click(trigger);

			const deepBlueSwatch = screen.getByRole("button", { name: "Deep Blue" });
			await user.click(deepBlueSwatch);

			expect(onChange).toHaveBeenCalledWith("#0f172a");
			expect(screen.getByDisplayValue("#0f172a")).toBeInTheDocument();
		});

		it("updates color via hex input typing", async () => {
			const user = userEvent.setup();
			const onChange = mock();
			render(<ControlledWrapper initialColor="#000000" onChange={onChange} />);

			const trigger = screen.getByRole("button", {
				name: /Background Color: #000000/i,
			});
			await user.click(trigger);

			const input = screen.getByLabelText("Hex color value");
			await user.clear(input);
			await user.type(input, "#ff0000");

			expect(onChange).toHaveBeenCalledWith("#ff0000");
			expect(input).toHaveValue("#ff0000");
			expect(input).toHaveAttribute("aria-invalid", "false");
		});

		it("marks input as invalid when typing invalid hex and restores on blur", async () => {
			const user = userEvent.setup();
			const onChange = mock();
			render(<ControlledWrapper initialColor="#000000" onChange={onChange} />);

			const trigger = screen.getByRole("button", {
				name: /Background Color: #000000/i,
			});
			await user.click(trigger);

			const input = screen.getByLabelText("Hex color value");
			await user.clear(input);
			await user.type(input, "#invalid");

			expect(input).toHaveAttribute("aria-invalid", "true");

			// On blur, invalid value reverts to last valid color
			await user.tab();
			expect(input).toHaveValue("#000000");
			expect(input).toHaveAttribute("aria-invalid", "false");
		});

		it("invokes EyeDropper when available and clicked", async () => {
			const user = userEvent.setup();
			const onChange = mock();
			const openMock = mock(() => Promise.resolve({ sRGBHex: "#123456" }));
			window.EyeDropper = mock(() => ({
				open: openMock,
			})) as unknown as typeof window.EyeDropper;

			render(<ControlledWrapper initialColor="#000000" onChange={onChange} />);

			const trigger = screen.getByRole("button", {
				name: /Background Color: #000000/i,
			});
			await user.click(trigger);

			const eyedropperBtn = screen.getByRole("button", {
				name: "Pick color from screen",
			});
			expect(eyedropperBtn).toBeInTheDocument();

			await user.click(eyedropperBtn);
			expect(openMock).toHaveBeenCalled();
			await waitFor(() => {
				expect(onChange).toHaveBeenCalledWith("#123456");
			});

			delete window.EyeDropper;
		});

		it("closes popover on Escape key", async () => {
			const user = userEvent.setup();
			render(<ControlledWrapper initialColor="#000000" />);

			const trigger = screen.getByRole("button", {
				name: /Background Color: #000000/i,
			});
			await user.click(trigger);

			expect(screen.getByLabelText("Hex color value")).toBeInTheDocument();

			await user.keyboard("{Escape}");

			await waitFor(() => {
				expect(
					screen.queryByLabelText("Hex color value"),
				).not.toBeInTheDocument();
			});
		});
	});

	describe("BrightnessInputField", () => {
		it("renders with label, input, and percent adornment", () => {
			render(<BrightnessWrapper initialValue={80} />);

			expect(screen.getByText("Brightness")).toBeInTheDocument();
			const input = screen.getByLabelText("Brightness");
			expect(input).toBeInTheDocument();
			expect(input).toHaveValue(80);
			expect(screen.getByText("%")).toBeInTheDocument();
		});

		it("updates numeric value via typing and clamps to min/max", async () => {
			const user = userEvent.setup();
			const onChange = mock();
			render(<BrightnessWrapper initialValue={50} onChange={onChange} />);

			const input = screen.getByLabelText("Brightness");
			await user.clear(input);
			await user.type(input, "75");

			expect(onChange).toHaveBeenCalledWith(75);
			expect(input).toHaveValue(75);

			// Test clamping to max 100
			await user.clear(input);
			await user.type(input, "150");
			expect(onChange).toHaveBeenCalledWith(100);
		});

		it("disables input when disabled prop is true", () => {
			render(<BrightnessWrapper disabled={true} />);
			const input = screen.getByLabelText("Brightness");
			expect(input).toBeDisabled();
		});
	});
});
