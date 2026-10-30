import { IconList, IconPlus } from "@tabler/icons-react";
import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { PlaylistItemRow } from "@/features/playlist/item-row";
import { usePlaylistStore } from "@/features/playlist/store";

export function PlaylistPanel() {
	const { items, selectedItemId, mode, activeConfirmDeleteId } =
		usePlaylistStore(
			useShallow((s) => ({
				items: s.items,
				selectedItemId: s.selectedItemId,
				mode: s.mode,
				activeConfirmDeleteId: s.activeConfirmDeleteId,
			})),
		);

	const gridRef = useRef<HTMLDivElement | null>(null);
	const organizeButtonRef = useRef<HTMLButtonElement | null>(null);
	const emptyAddButtonRef = useRef<HTMLButtonElement | null>(null);

	const isEditMode = mode === "edit";

	const focusActiveRow = () => {
		requestAnimationFrame(() => {
			const activeRow = gridRef.current?.querySelector<HTMLElement>(
				'[role="row"][aria-selected="true"]',
			);
			activeRow?.focus();
		});
	};

	// Scroll newly selected or added item into view
	useEffect(() => {
		if (!selectedItemId || !gridRef.current) return;
		const activeRow = gridRef.current.querySelector<HTMLElement>(
			'[role="row"][aria-selected="true"]',
		);
		if (activeRow) {
			activeRow.scrollIntoView({ block: "nearest", behavior: "smooth" });
		}
	}, [selectedItemId]);

	const handleAdd = () => {
		usePlaylistStore.getState().addItem();
		focusActiveRow();
	};

	const handleToggleMode = () => {
		usePlaylistStore.getState().toggleMode();
	};

	const handleDeleteItem = (id: string) => {
		const isLastItem = items.length === 1;
		usePlaylistStore.getState().deleteItem(id);
		requestAnimationFrame(() => {
			if (isLastItem) {
				emptyAddButtonRef.current?.focus();
				return;
			}
			const activeRow = gridRef.current?.querySelector<HTMLElement>(
				'[role="row"][aria-selected="true"]',
			);
			if (activeRow) {
				activeRow.focus();
			} else {
				organizeButtonRef.current?.focus();
			}
		});
	};

	const handleSelectNext = () => {
		usePlaylistStore.getState().selectNext();
		focusActiveRow();
	};

	const handleSelectPrevious = () => {
		usePlaylistStore.getState().selectPrevious();
		focusActiveRow();
	};

	const handleGridKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		// Scoped arrow keys on grid
		if (e.key === "ArrowDown") {
			e.preventDefault();
			handleSelectNext();
			return;
		}

		if (e.key === "ArrowUp") {
			e.preventDefault();
			handleSelectPrevious();
			return;
		}

		if (e.key === "Escape") {
			if (isEditMode) {
				e.preventDefault();
				usePlaylistStore.getState().setMode("view");
				// Restore focus to active row, or organize button if no items
				requestAnimationFrame(() => {
					const activeRow = gridRef.current?.querySelector<HTMLElement>(
						'[role="row"][aria-selected="true"]',
					);
					if (activeRow) {
						activeRow.focus();
					} else {
						organizeButtonRef.current?.focus();
					}
				});
			}
		}
	};

	return (
		<section
			aria-label="Playlist panel"
			className="flex h-full w-full flex-col overflow-hidden bg-background text-foreground"
		>
			<header className="flex h-10 shrink-0 items-center justify-between border-b px-3">
				<div className="flex items-center gap-2">
					<IconList className="size-4 text-muted-foreground" />
					<h2 className="font-semibold text-sm">Playlist</h2>
				</div>
				<div className="flex items-center gap-1">
					<Button
						variant="ghost"
						size="sm"
						onClick={handleAdd}
						title="Add item"
						aria-label="Add item"
						className="h-7 px-2 text-xs"
					>
						<IconPlus className="mr-1 size-3.5" />
						Add
					</Button>
					<Button
						ref={organizeButtonRef}
						variant={isEditMode ? "secondary" : "ghost"}
						size="sm"
						onClick={handleToggleMode}
						disabled={items.length === 0}
						aria-pressed={isEditMode}
						className="h-7 px-2 text-xs"
					>
						{isEditMode ? "Done" : "Organize"}
					</Button>
				</div>
			</header>

			<div className="min-h-0 flex-1 overflow-y-auto p-2">
				{items.length === 0 ? (
					<Empty className="border-none">
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<IconList className="size-4" />
							</EmptyMedia>
							<EmptyTitle>Playlist is empty</EmptyTitle>
							<EmptyDescription>
								Add items to build your worship service order.
							</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<Button
								ref={emptyAddButtonRef}
								variant="default"
								size="sm"
								onClick={handleAdd}
							>
								<IconPlus className="mr-1 size-3.5" />
								Add Item
							</Button>
						</EmptyContent>
					</Empty>
				) : (
					// biome-ignore lint/a11y/useSemanticElements: APG Composite Grid
					<div
						ref={gridRef}
						role="grid"
						aria-label="Playlist items"
						tabIndex={-1}
						onKeyDown={handleGridKeyDown}
						className="flex flex-col gap-1"
					>
						{items.map((item, index) => (
							<PlaylistItemRow
								key={item.id}
								item={item}
								index={index}
								totalCount={items.length}
								isSelected={item.id === selectedItemId}
								mode={mode}
								open={activeConfirmDeleteId === item.id}
								onDeleteConfirmOpenChange={(open) => {
									if (open) {
										usePlaylistStore.getState().openDeleteConfirm(item.id);
									} else {
										usePlaylistStore.getState().closeDeleteConfirm();
									}
								}}
								onExitToHeader={() => organizeButtonRef.current?.focus()}
								onSelect={() => usePlaylistStore.getState().selectItem(item.id)}
								onSelectNext={handleSelectNext}
								onSelectPrevious={handleSelectPrevious}
								onMoveUp={() => usePlaylistStore.getState().moveItemUp(item.id)}
								onMoveDown={() =>
									usePlaylistStore.getState().moveItemDown(item.id)
								}
								onDelete={() => handleDeleteItem(item.id)}
							/>
						))}
					</div>
				)}
			</div>
		</section>
	);
}
