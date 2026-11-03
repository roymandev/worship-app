import { IconColorPicker } from "@tabler/icons-react";
import { cn } from "cn";
import { useEffect, useId, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

export const DEFAULT_PRESET_COLORS = [
	{ name: "Black", value: "#000000" },
	{ name: "Warm Black", value: "#121212" },
	{ name: "Charcoal", value: "#262626" },
	{ name: "Deep Blue", value: "#0f172a" },
	{ name: "Deep Purple", value: "#2e1065" },
	{ name: "Forest Green", value: "#052e16" },
	{ name: "Burgundy", value: "#450a0a" },
] as const;

export type PresetColor = {
	readonly name: string;
	readonly value: string;
};

export type ColorPickerFieldProps = {
	readonly value: string;
	readonly onChange: (color: string) => void;
	readonly id?: string;
	readonly label?: string;
	readonly disabled?: boolean;
	readonly presets?: readonly PresetColor[];
	readonly className?: string;
	readonly inline?: boolean;
};

// Normalize and validate 3-hex or 6-hex strings
export function isValidHexColor(hex: string): boolean {
	return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);
}

export function normalizeHexColor(hex: string): string {
	let normalized = hex;
	if (!normalized.startsWith("#")) {
		normalized = `#${normalized}`;
	}
	return normalized.toUpperCase();
}

declare global {
	interface Window {
		EyeDropper?: new () => {
			open: (options?: {
				signal?: AbortSignal;
			}) => Promise<{ sRGBHex: string }>;
		};
	}
}

export type BrightnessInputFieldProps = {
	readonly value: number;
	readonly onChange: (value: number) => void;
	readonly id?: string;
	readonly label?: string;
	readonly min?: number;
	readonly max?: number;
	readonly step?: number;
	readonly disabled?: boolean;
	readonly className?: string;
};

export function BrightnessInputField({
	value,
	onChange,
	id,
	label = "Brightness",
	min = 0,
	max = 100,
	step = 1,
	disabled = false,
	className,
}: BrightnessInputFieldProps) {
	const generatedId = useId();
	const inputId = id ?? generatedId;

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const raw = e.target.value;
		if (raw === "") {
			onChange(0);
			return;
		}
		const num = Number(raw);
		if (!Number.isNaN(num)) {
			const clamped = Math.min(Math.max(num, min), max);
			onChange(clamped);
		}
	};

	return (
		<div className={cn("flex items-center justify-between gap-2", className)}>
			{label && (
				<label
					htmlFor={inputId}
					className="font-medium text-muted-foreground text-xs"
				>
					{label}
				</label>
			)}
			<div className="relative flex items-center">
				<Input
					id={inputId}
					type="number"
					min={min}
					max={max}
					step={step}
					value={Number.isNaN(value) ? "" : value}
					onChange={handleChange}
					disabled={disabled}
					aria-label={label}
					className="h-8 w-20 pr-6 text-right font-mono text-xs [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
				/>
				<span
					aria-hidden="true"
					className="pointer-events-none absolute right-2 select-none font-mono text-muted-foreground text-xs"
				>
					%
				</span>
			</div>
		</div>
	);
}

export function ColorPickerField({
	value,
	onChange,
	id,
	label = "Background Color",
	disabled = false,
	presets = DEFAULT_PRESET_COLORS,
	className,
	inline = true,
}: ColorPickerFieldProps) {
	const generatedId = useId();
	const inputId = id ?? generatedId;
	const [open, setOpen] = useState(false);
	const [textValue, setTextValue] = useState(value);
	const [isValid, setIsValid] = useState(true);

	useEffect(() => {
		setTextValue(value);
		setIsValid(isValidHexColor(value));
	}, [value]);

	const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let raw = e.target.value;
		if (raw.length > 0 && !raw.startsWith("#")) {
			raw = `#${raw}`;
		}
		setTextValue(raw);

		if (isValidHexColor(raw)) {
			setIsValid(true);
			onChange(raw);
		} else {
			setIsValid(false);
		}
	};

	const handleBlur = () => {
		if (!isValidHexColor(textValue)) {
			// Reset text to current value on blur if invalid
			setTextValue(value);
			setIsValid(true);
		}
	};

	const hasEyeDropper =
		typeof window !== "undefined" && typeof window.EyeDropper !== "undefined";

	const handleEyeDropper = async () => {
		if (!hasEyeDropper || !window.EyeDropper) return;
		try {
			const eyeDropper = new window.EyeDropper();
			const result = await eyeDropper.open();
			if (result?.sRGBHex) {
				onChange(result.sRGBHex);
			}
		} catch {
			// User canceled or eye dropper failed, ignore
		}
	};

	return (
		<div
			className={cn(
				inline
					? "flex items-center justify-between gap-2"
					: "flex flex-col gap-1.5",
				className,
			)}
		>
			{label && (
				<label
					htmlFor={inputId}
					className="font-medium text-muted-foreground text-xs"
				>
					{label}
				</label>
			)}

			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger
					id={inputId}
					disabled={disabled}
					aria-label={`${label}: ${value}`}
					className={cn(
						"focus-ring flex h-8 items-center gap-2 rounded-md border border-input bg-transparent px-2.5 py-1 text-xs text-foreground shadow-xs transition-[color,box-shadow] outline-none hover:bg-accent/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
						inline ? "shrink-0" : "w-full",
					)}
				>
					<span
						aria-hidden="true"
						className="size-4 shrink-0 rounded-full border border-border shadow-xs"
						style={{
							backgroundColor: isValidHexColor(value) ? value : "#000000",
						}}
					/>
					<span className="font-mono text-xs uppercase">{value}</span>
				</PopoverTrigger>

				<PopoverContent
					align="start"
					sideOffset={6}
					className="flex w-64 flex-col gap-3 p-3"
				>
					{/* Canvas HexColorPicker */}
					<div className="w-full [&_.react-colorful]:h-40 [&_.react-colorful]:w-full [&_.react-colorful]:rounded-lg">
						<HexColorPicker color={value} onChange={onChange} />
					</div>

					{/* Synchronized Hex Input & Actions */}
					<div className="flex items-center gap-2">
						<div className="relative flex-1">
							<Input
								value={textValue}
								onChange={handleTextChange}
								onBlur={handleBlur}
								placeholder="#000000"
								maxLength={7}
								aria-label="Hex color value"
								aria-invalid={!isValid}
								className={cn(
									"font-mono text-xs uppercase",
									!isValid && "border-destructive text-destructive",
								)}
							/>
						</div>

						{hasEyeDropper && (
							<Button
								type="button"
								variant="outline"
								size="icon"
								className="size-8 shrink-0"
								onClick={handleEyeDropper}
								aria-label="Pick color from screen"
								title="Pick color from screen"
							>
								<IconColorPicker className="size-4" />
							</Button>
						)}
					</div>

					{/* Palette Preset Swatches */}
					{presets.length > 0 && (
						<fieldset className="flex flex-col gap-1.5 border-border border-t pt-1">
							<legend className="font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
								Presets
							</legend>
							<div className="flex flex-wrap items-center gap-1.5">
								{presets.map((preset) => {
									const isSelected =
										value.toLowerCase() === preset.value.toLowerCase();
									return (
										<button
											key={preset.value}
											type="button"
											aria-label={preset.name}
											aria-pressed={isSelected}
											title={preset.name}
											onClick={() => onChange(preset.value)}
											className={cn(
												"focus-ring relative size-6 rounded-md border border-border transition-transform hover:scale-110",
												isSelected && "ring-2 ring-primary ring-offset-1",
											)}
											style={{ backgroundColor: preset.value }}
										/>
									);
								})}
							</div>
						</fieldset>
					)}
				</PopoverContent>
			</Popover>
		</div>
	);
}
