import { cn } from "cn";
import type * as React from "react";
import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { EmptyState } from "@/components/ui/empty";
import { parseCues } from "@/features/playlist/cues";
import { usePlaylistStore } from "@/features/playlist/store";
import { useCueListCursor } from "@/features/playlist/use-cue-list-cursor";

export type CueListProps = {
	target: "stage" | "live";
	ariaLabel: string;
	emptyMessage: string;
	className?: string;
};

export function CueList({
	target,
	ariaLabel,
	emptyMessage,
	className,
}: CueListProps) {
	const { itemId, cueIndex, selectCue, navigateCue } = useCueListCursor(target);
	const { items, liveItemId, liveCueIndex, goLive } = usePlaylistStore(
		useShallow((s) => ({
			items: s.items,
			liveItemId: s.liveItemId,
			liveCueIndex: s.liveCueIndex,
			goLive: s.goLive,
		})),
	);

	const gridRef = useRef<HTMLDivElement | null>(null);

	const activeItem = itemId ? items.find((i) => i.id === itemId) : null;
	const cues = parseCues(activeItem?.content);

	const focusActiveRow = () => {
		requestAnimationFrame(() => {
			const activeRow = gridRef.current?.querySelector<HTMLElement>(
				'[role="row"][aria-selected="true"]',
			);
			activeRow?.focus();
		});
	};

	const triggerGoLiveForCue = (index: number) => {
		if (itemId === null) return;
		if (itemId === liveItemId && index === liveCueIndex) return;

		goLive(itemId, index);
		requestAnimationFrame(() => {
			const liveCueRow =
				document.querySelector<HTMLElement>(
					`[data-live-cue-index="${index}"]`,
				) ??
				document.querySelector<HTMLElement>(
					'[role="grid"][aria-label="Live cue items"] [role="row"][aria-selected="true"]',
				);
			liveCueRow?.focus();
		});
	};

	// Auto-scroll active cue into view on cueIndex change
	// biome-ignore lint/correctness/useExhaustiveDependencies: itemId is included to re-scroll on item switch
	useEffect(() => {
		if (cueIndex === null || !gridRef.current) return;
		const activeRow = gridRef.current.querySelector<HTMLElement>(
			`[role="row"][data-cue-index="${cueIndex}"], [role="row"][data-live-cue-index="${cueIndex}"]`,
		);
		if (activeRow) {
			activeRow.scrollIntoView({ block: "nearest", behavior: "smooth" });
		}
	}, [cueIndex, itemId]);

	const handleGridKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			navigateCue("next");
			focusActiveRow();
			return;
		}

		if (e.key === "ArrowUp") {
			e.preventDefault();
			navigateCue("prev");
			focusActiveRow();
			return;
		}

		if (e.key === "Home") {
			e.preventDefault();
			navigateCue("first");
			focusActiveRow();
			return;
		}

		if (e.key === "End") {
			e.preventDefault();
			navigateCue("last");
			focusActiveRow();
			return;
		}

		if (target === "stage" && e.key === "Enter") {
			const targetIndex = cueIndex ?? 0;
			if (cues.length > 0 && targetIndex >= 0 && targetIndex < cues.length) {
				e.preventDefault();
				triggerGoLiveForCue(targetIndex);
			}
			return;
		}
	};

	if (cues.length === 0) {
		return <EmptyState title="No cues" description={emptyMessage} />;
	}

	return (
		// biome-ignore lint/a11y/useSemanticElements: APG Composite Grid
		<div
			ref={gridRef}
			role="grid"
			aria-label={ariaLabel}
			tabIndex={-1}
			onKeyDown={handleGridKeyDown}
			className={cn("flex flex-col gap-1", className)}
		>
			{cues.map((cue, index) => {
				const isSelected = index === cueIndex;
				const isFocusable = isSelected || (cueIndex === null && index === 0);
				return (
					// biome-ignore lint/a11y/useSemanticElements: APG Composite Grid Row
					// biome-ignore lint/a11y/useKeyWithClickEvents: Keyboard roving navigation handled at grid container
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: Cues are derived sequentially from parsed content
						key={`${itemId}-${target}-cue-${index}`}
						role="row"
						tabIndex={isFocusable ? 0 : -1}
						aria-selected={isSelected}
						data-cue-index={target === "stage" ? index : undefined}
						data-live-cue-index={target === "live" ? index : undefined}
						onClick={() => selectCue(index)}
						onDoubleClick={
							target === "stage" ? () => triggerGoLiveForCue(index) : undefined
						}
						className={cn(
							"group flex items-center justify-between gap-2 rounded-md px-3 py-2 text-xs transition-colors focus-ring-inset select-none scroll-my-1",
							isSelected
								? "bg-accent font-medium text-accent-foreground"
								: "text-foreground hover:bg-muted/50",
						)}
					>
						{/* biome-ignore lint/a11y/useSemanticElements: APG Composite Grid Cell */}
						{/* biome-ignore lint/a11y/useFocusableInteractive: Row manages roving focus */}
						<div
							role="gridcell"
							className="min-w-0 flex-1 break-words leading-relaxed whitespace-pre-line"
						>
							{cue}
						</div>
					</div>
				);
			})}
		</div>
	);
}
