import { IconEraser, IconEyeOff } from "@tabler/icons-react";
import { cn } from "cn";

const BADGE_BASE_CLASS =
	"inline-flex items-center gap-1.5 font-semibold text-xs px-3 py-1 rounded-full absolute bottom-[clamp(0.5rem,2cqw,1rem)] left-1/2 -translate-x-1/2 pointer-events-none backdrop-blur-xs border shadow-sm";

export type PreviewCanvasProps = {
	text: string | null;
	variant?: "stage" | "live";
	className?: string;
	isClear?: boolean;
	isBlackout?: boolean;
};

export function PreviewCanvas({
	text,
	variant = "stage",
	className,
	isClear = false,
	isBlackout = false,
}: PreviewCanvasProps) {
	const trimmedText = text?.trim();
	const hasContent = Boolean(trimmedText) && !isClear && !isBlackout;

	const badgeConfig = isBlackout
		? {
				srText: "Output is blacked out",
				label: "Blackout",
				className: "bg-red-600/90 text-white border-red-500/50",
				Icon: IconEyeOff,
			}
		: isClear
			? {
					srText: "Output text is cleared",
					label: "Clear",
					className: "bg-amber-500/90 text-amber-950 border-amber-400/50",
					Icon: IconEraser,
				}
			: null;

	return (
		<section
			aria-label={variant === "live" ? "Live preview canvas" : "Preview canvas"}
			data-variant={variant}
			className={cn(
				"relative @container flex aspect-video w-[min(100%,calc(100cqh*16/9))] max-h-full max-w-full items-center justify-center rounded-sm bg-black p-[clamp(0.75rem,2.5cqw,1.5rem)] text-center text-white",
				className,
			)}
		>
			{hasContent ? (
				<p className="break-words font-medium text-[clamp(0.875rem,3.5cqw,1.25rem)] leading-relaxed whitespace-pre-wrap select-none font-sans">
					{text}
				</p>
			) : (
				<span className="sr-only">{badgeConfig?.srText ?? "Blank screen"}</span>
			)}
			{badgeConfig ? (
				<span
					aria-hidden="true"
					className={cn(BADGE_BASE_CLASS, badgeConfig.className)}
				>
					<badgeConfig.Icon className="size-3.5" />
					{badgeConfig.label}
				</span>
			) : null}
		</section>
	);
}
