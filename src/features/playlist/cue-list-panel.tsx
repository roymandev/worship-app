import { IconPresentation } from "@tabler/icons-react";
import { cn } from "cn";
import type * as React from "react";
import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { EmptyState } from "@/components/ui/empty";
import { parseCues } from "@/features/playlist/cues";
import { usePlaylistStore } from "@/features/playlist/store";

export function CueListPanel() {
	const {
		items,
		selectedItemId,
		selectedCueIndex,
		liveItemId,
		liveCueIndex,
		selectCue,
		selectPreviousCue,
		selectNextCue,
		goLive,
	} = usePlaylistStore(
		useShallow((s) => ({
			items: s.items,
			selectedItemId: s.selectedItemId,
			selectedCueIndex: s.selectedCueIndex,
			liveItemId: s.liveItemId,
			liveCueIndex: s.liveCueIndex,
			selectCue: s.selectCue,
			selectPreviousCue: s.selectPreviousCue,
			selectNextCue: s.selectNextCue,
			goLive: s.goLive,
		})),
	);

	const gridRef = useRef<HTMLDivElement | null>(null);

	const selectedItem = items.find((i) => i.id === selectedItemId);
	const cues = parseCues(selectedItem?.content);

	const focusActiveRow = () => {
		requestAnimationFrame(() => {
			const activeRow = gridRef.current?.querySelector<HTMLElement>(
				'[role="row"][aria-selected="true"]',
			);
			activeRow?.focus();
		});
	};

	const triggerGoLiveForCue = (index: number) => {
		if (selectedItemId === null) return;
		if (selectedItemId === liveItemId && index === liveCueIndex) return;

		goLive(selectedItemId, index);
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

	// Auto-scroll active cue into view on selectedCueIndex change
	// biome-ignore lint/correctness/useExhaustiveDependencies: selectedItemId is included to re-scroll on item switch
	useEffect(() => {
		if (selectedCueIndex === null || !gridRef.current) return;
		const activeRow = gridRef.current.querySelector<HTMLElement>(
			`[role="row"][data-cue-index="${selectedCueIndex}"]`,
		);
		if (activeRow) {
			activeRow.scrollIntoView({ block: "nearest", behavior: "smooth" });
		}
	}, [selectedCueIndex, selectedItemId]);

	const handleGridKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			selectNextCue();
			focusActiveRow();
			return;
		}

		if (e.key === "ArrowUp") {
			e.preventDefault();
			selectPreviousCue();
			focusActiveRow();
			return;
		}

		if (e.key === "Enter") {
			const targetIndex = selectedCueIndex ?? 0;
			if (cues.length > 0 && targetIndex >= 0 && targetIndex < cues.length) {
				e.preventDefault();
				triggerGoLiveForCue(targetIndex);
			}
			return;
		}
	};

	return (
		<section
			aria-label="Cue list panel"
			className="flex h-full w-full flex-col overflow-hidden bg-background text-foreground"
		>
			<header className="flex h-10 shrink-0 items-center gap-2 border-b px-3">
				<IconPresentation className="size-4 text-muted-foreground" />
				<h2 className="truncate font-semibold text-sm">
					{selectedItem?.title ?? "No item selected"}
				</h2>
			</header>

			<div className="min-h-0 flex-1 overflow-y-auto p-2">
				{cues.length === 0 ? (
					<EmptyState
						className="border-none"
						icon={<IconPresentation className="size-4" />}
						title="No cues"
						description="This playlist item has no content yet."
					/>
				) : (
					// biome-ignore lint/a11y/useSemanticElements: APG Composite Grid
					<div
						ref={gridRef}
						role="grid"
						aria-label="Cue items"
						tabIndex={-1}
						onKeyDown={handleGridKeyDown}
						className="flex flex-col gap-1"
					>
						{cues.map((cue, index) => {
							const isSelected = index === selectedCueIndex;
							const isFocusable =
								isSelected || (selectedCueIndex === null && index === 0);
							return (
								// biome-ignore lint/a11y/useSemanticElements: APG Composite Grid Row
								// biome-ignore lint/a11y/useKeyWithClickEvents: Keyboard roving navigation handled at grid container
								<div
									// biome-ignore lint/suspicious/noArrayIndexKey: Cues are derived sequentially from parsed content
									key={`${selectedItemId}-cue-${index}`}
									role="row"
									tabIndex={isFocusable ? 0 : -1}
									aria-selected={isSelected}
									data-cue-index={index}
									onClick={() => selectCue(index)}
									onDoubleClick={() => triggerGoLiveForCue(index)}
									className={cn(
										"group flex items-center justify-between gap-2 rounded-md px-3 py-2 text-xs transition-colors focus-ring-inset select-none",
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
				)}
			</div>
		</section>
	);
}
