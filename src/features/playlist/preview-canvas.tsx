import { cn } from "cn";

export type PreviewCanvasProps = {
	text: string | null;
	variant?: "stage" | "live";
	className?: string;
};

export function PreviewCanvas({
	text,
	variant = "stage",
	className,
}: PreviewCanvasProps) {
	const trimmedText = text?.trim();
	const hasContent = Boolean(trimmedText);

	return (
		<section
			aria-label={variant === "live" ? "Live preview canvas" : "Preview canvas"}
			data-variant={variant}
			className={cn(
				"@container flex aspect-video w-[min(100%,calc(100cqh*16/9))] max-h-full max-w-full items-center justify-center rounded-sm bg-black p-[clamp(0.75rem,2.5cqw,1.5rem)] text-center text-white",
				className,
			)}
		>
			{hasContent ? (
				<p className="break-words font-medium text-[clamp(0.875rem,3.5cqw,1.25rem)] leading-relaxed whitespace-pre-wrap select-none font-sans">
					{text}
				</p>
			) : (
				<span className="sr-only">Blank screen</span>
			)}
		</section>
	);
}
