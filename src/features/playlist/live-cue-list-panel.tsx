import { IconVideo } from "@tabler/icons-react";
import { cn } from "cn";
import type * as React from "react";
import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { EmptyState } from "@/components/ui/empty";
import { parseCues } from "@/features/playlist/cues";
import { usePlaylistStore } from "@/features/playlist/store";

export function LiveCueListPanel() {
	const {
		items,
		liveItemId,
		liveCueIndex,
		selectLiveCue,
		selectPreviousLiveCue,
		selectNextLiveCue,
	} = usePlaylistStore(
		useShallow((s) => ({
			items: s.items,
			liveItemId: s.liveItemId,
			liveCueIndex: s.liveCueIndex,
			selectLiveCue: s.selectLiveCue,
			selectPreviousLiveCue: s.selectPreviousLiveCue,
			selectNextLiveCue: s.selectNextLiveCue,
		})),
	);

	const gridRef = useRef<HTMLDivElement | null>(null);

	const liveItem = liveItemId ? items.find((i) => i.id === liveItemId) : null;
	const cues = parseCues(liveItem?.content);

	const focusActiveRow = () => {
		requestAnimationFrame(() => {
			const activeRow = gridRef.current?.querySelector<HTMLElement>(
				'[role="row"][aria-selected="true"]',
			);
			activeRow?.focus();
		});
	};

	// Auto-scroll active live cue into view on liveCueIndex change
	// biome-ignore lint/correctness/useExhaustiveDependencies: liveItemId is included to re-scroll on item switch
	useEffect(() => {
		if (liveCueIndex === null || !gridRef.current) return;
		const activeRow = gridRef.current.querySelector<HTMLElement>(
			`[role="row"][data-live-cue-index="${liveCueIndex}"]`,
		);
		if (activeRow) {
			activeRow.scrollIntoView({ block: "nearest", behavior: "smooth" });
		}
	}, [liveCueIndex, liveItemId]);

	const handleGridKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			selectNextLiveCue();
			focusActiveRow();
			return;
		}

		if (e.key === "ArrowUp") {
			e.preventDefault();
			selectPreviousLiveCue();
			focusActiveRow();
			return;
		}
	};

	return (
		<section
			aria-label="Live cue list panel"
			className="flex h-full w-full flex-col overflow-hidden bg-background text-foreground"
		>
			<header className="flex h-10 shrink-0 items-center gap-2 border-b px-3">
				<IconVideo className="size-4 text-muted-foreground" />
				<h2 className="truncate font-semibold text-sm">
					{liveItem?.title ?? "No active live item"}
				</h2>
			</header>

			<div className="min-h-0 flex-1 overflow-y-auto p-2">
				{!liveItem ? (
					<EmptyState
						className="border-none"
						icon={<IconVideo className="size-4" />}
						title="No live item"
						description="Double-click an item or cue to go live."
					/>
				) : cues.length === 0 ? (
					<EmptyState
						className="border-none"
						icon={<IconVideo className="size-4" />}
						title="No cues"
						description="This active live item has no cues."
					/>
				) : (
					// biome-ignore lint/a11y/useSemanticElements: APG Composite Grid
					<div
						ref={gridRef}
						role="grid"
						aria-label="Live cue items"
						tabIndex={-1}
						onKeyDown={handleGridKeyDown}
						className="flex flex-col gap-1"
					>
						{cues.map((cue, index) => {
							const isSelected = index === liveCueIndex;
							const isFocusable =
								isSelected || (liveCueIndex === null && index === 0);
							return (
								// biome-ignore lint/a11y/useSemanticElements: APG Composite Grid Row
								// biome-ignore lint/a11y/useKeyWithClickEvents: Keyboard roving navigation handled at grid container
								<div
									// biome-ignore lint/suspicious/noArrayIndexKey: Cues are derived sequentially from parsed content
									key={`${liveItemId}-live-cue-${index}`}
									role="row"
									tabIndex={isFocusable ? 0 : -1}
									aria-selected={isSelected}
									data-live-cue-index={index}
									onClick={() => selectLiveCue(index)}
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
				)}
			</div>
		</section>
	);
}
