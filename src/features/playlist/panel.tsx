import {
	IconArrowDown,
	IconArrowUp,
	IconList,
	IconPencil,
	IconPlayerPlay,
	IconPlus,
	IconTrash,
} from "@tabler/icons-react";
import { cn } from "cn";
import type * as React from "react";
import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty";
import {
	Popover,
	PopoverClose,
	PopoverContent,
	PopoverDescription,
	PopoverTitle,
} from "@/components/ui/popover";
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

	// Direct references to rows and action buttons for precise focus management
	const rowRefs = useRef<Map<string, HTMLDivElement>>(new Map());
	const actionCellRefs = useRef<Map<string, HTMLDivElement>>(new Map());
	const moveUpRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
	const moveDownRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
	const deleteTriggerRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

	// References inside singleton delete confirm popover
	const popoverCancelRef = useRef<HTMLButtonElement | null>(null);
	const popoverConfirmRef = useRef<HTMLButtonElement | null>(null);

	// Track the element that triggered the delete popover to restore focus upon cancel/dismiss
	const deleteTriggerOriginRef = useRef<HTMLElement | null>(null);

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

	const handleSelectNext = () => {
		usePlaylistStore.getState().selectNext();
		focusActiveRow();
	};

	const handleSelectPrevious = () => {
		usePlaylistStore.getState().selectPrevious();
		focusActiveRow();
	};

	const handleMoveUp = (id: string, index: number) => {
		usePlaylistStore.getState().moveItemUp(id);
		// If moving up places item at boundary (index 1 -> index 0), moveUp button will become disabled
		if (index === 1) {
			requestAnimationFrame(() => {
				const moveDownBtn = moveDownRefs.current.get(id);
				if (moveDownBtn && !moveDownBtn.disabled) {
					moveDownBtn.focus();
				} else {
					rowRefs.current.get(id)?.focus();
				}
			});
		}
	};

	const handleMoveDown = (id: string, index: number) => {
		usePlaylistStore.getState().moveItemDown(id);
		// If moving down places item at bottom boundary, moveDown button will become disabled
		if (index === items.length - 2) {
			requestAnimationFrame(() => {
				const moveUpBtn = moveUpRefs.current.get(id);
				if (moveUpBtn && !moveUpBtn.disabled) {
					moveUpBtn.focus();
				} else {
					rowRefs.current.get(id)?.focus();
				}
			});
		}
	};

	const handleOpenDelete = (id: string, triggerElement: HTMLElement | null) => {
		deleteTriggerOriginRef.current = triggerElement;
		usePlaylistStore.getState().openDeleteConfirm(id);
	};

	const handleCloseDelete = () => {
		usePlaylistStore.getState().closeDeleteConfirm();
		if (
			deleteTriggerOriginRef.current &&
			document.contains(deleteTriggerOriginRef.current)
		) {
			deleteTriggerOriginRef.current.focus();
		}
	};

	const handleConfirmDelete = () => {
		if (!activeConfirmDeleteId) return;
		const idToDelete = activeConfirmDeleteId;
		const isLastItem = items.length === 1;

		const deletedIndex = items.findIndex((item) => item.id === idToDelete);
		let targetRestoreId: string | null = null;
		if (!isLastItem && deletedIndex !== -1) {
			const remainingItems = items.filter((item) => item.id !== idToDelete);
			if (deletedIndex < remainingItems.length) {
				targetRestoreId = remainingItems[deletedIndex].id;
			} else {
				targetRestoreId = remainingItems[remainingItems.length - 1].id;
			}
		}

		usePlaylistStore.getState().deleteItem(idToDelete);
		if (targetRestoreId) {
			usePlaylistStore.getState().selectItem(targetRestoreId);
		}

		requestAnimationFrame(() => {
			if (isLastItem) {
				emptyAddButtonRef.current?.focus();
				return;
			}
			const targetRow = targetRestoreId
				? rowRefs.current.get(targetRestoreId)
				: null;
			const activeRow =
				targetRow ??
				gridRef.current?.querySelector<HTMLElement>(
					'[role="row"][aria-selected="true"]',
				);
			if (activeRow) {
				activeRow.focus();
			} else {
				organizeButtonRef.current?.focus();
			}
		});
	};

	const handleGridKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
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

	const handleRowKeyDown = (
		e: React.KeyboardEvent<HTMLDivElement>,
		id: string,
		index: number,
	) => {
		// Alt+ArrowUp: Move Up
		if (e.altKey && e.key === "ArrowUp") {
			e.preventDefault();
			e.stopPropagation();
			if (index > 0) {
				handleMoveUp(id, index);
			}
			return;
		}

		// Alt+ArrowDown: Move Down
		if (e.altKey && e.key === "ArrowDown") {
			e.preventDefault();
			e.stopPropagation();
			if (index < items.length - 1) {
				handleMoveDown(id, index);
			}
			return;
		}

		// Backspace or Delete: trigger delete confirm popover
		if (e.key === "Backspace" || e.key === "Delete") {
			e.preventDefault();
			e.stopPropagation();
			handleOpenDelete(id, e.currentTarget);
			return;
		}

		// ArrowRight: focus the first interactive button in the action cell
		if (e.key === "ArrowRight") {
			const actionCell = actionCellRefs.current.get(id);
			const firstButton = actionCell?.querySelector<HTMLButtonElement>(
				"button:not([disabled])",
			);
			if (firstButton) {
				e.preventDefault();
				e.stopPropagation();
				firstButton.focus();
			}
			return;
		}
	};

	const handleActionCellKeyDown = (
		e: React.KeyboardEvent<HTMLDivElement>,
		id: string,
	) => {
		if (e.shiftKey && e.key === "Tab") {
			e.preventDefault();
			e.stopPropagation();
			organizeButtonRef.current?.focus();
			return;
		}

		const actionCell = actionCellRefs.current.get(id);
		const enabledButtons = Array.from(
			actionCell?.querySelectorAll<HTMLButtonElement>(
				"button:not([disabled])",
			) ?? [],
		);
		const currentIndex = enabledButtons.indexOf(
			document.activeElement as HTMLButtonElement,
		);

		if (e.key === "ArrowRight") {
			if (currentIndex !== -1 && currentIndex < enabledButtons.length - 1) {
				e.preventDefault();
				e.stopPropagation();
				enabledButtons[currentIndex + 1].focus();
			} else {
				e.preventDefault();
				e.stopPropagation();
			}
			return;
		}

		if (e.key === "ArrowLeft") {
			e.preventDefault();
			e.stopPropagation();
			if (currentIndex > 0) {
				enabledButtons[currentIndex - 1].focus();
			} else {
				rowRefs.current.get(id)?.focus();
			}
			return;
		}

		if (e.key === "Escape") {
			e.preventDefault();
			e.stopPropagation();
			rowRefs.current.get(id)?.focus();
			return;
		}

		if (e.key === "ArrowDown") {
			e.preventDefault();
			e.stopPropagation();
			handleSelectNext();
			return;
		}

		if (e.key === "ArrowUp") {
			e.preventDefault();
			e.stopPropagation();
			handleSelectPrevious();
			return;
		}
	};

	const handlePopoverKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (e.key === "Escape") {
			e.stopPropagation();
			handleCloseDelete();
			return;
		}

		if (e.key === "ArrowUp" || e.key === "ArrowDown") {
			e.preventDefault();
			e.stopPropagation();
			return;
		}

		if (e.key === "ArrowRight") {
			e.preventDefault();
			e.stopPropagation();
			if (document.activeElement === popoverCancelRef.current) {
				popoverConfirmRef.current?.focus();
			}
			return;
		}

		if (e.key === "ArrowLeft") {
			e.preventDefault();
			e.stopPropagation();
			if (document.activeElement === popoverConfirmRef.current) {
				popoverCancelRef.current?.focus();
			}
			return;
		}

		if (e.key === "Tab") {
			e.stopPropagation();
			if (e.shiftKey) {
				if (document.activeElement !== popoverConfirmRef.current) {
					e.preventDefault();
					popoverConfirmRef.current?.focus();
				}
			} else {
				if (document.activeElement !== popoverCancelRef.current) {
					e.preventDefault();
					popoverCancelRef.current?.focus();
				}
			}
			return;
		}
	};

	// Determine dynamic popover anchor element
	const activeAnchorElement = activeConfirmDeleteId
		? (deleteTriggerRefs.current.get(activeConfirmDeleteId) ??
			rowRefs.current.get(activeConfirmDeleteId) ??
			null)
		: null;

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
					<EmptyState
						className="border-none"
						icon={<IconList className="size-4" />}
						title="Playlist is empty"
						description="Add items to build your worship service order."
						action={
							<Button
								ref={emptyAddButtonRef}
								variant="default"
								size="sm"
								onClick={handleAdd}
							>
								<IconPlus className="mr-1 size-3.5" />
								Add Item
							</Button>
						}
					/>
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
						{items.map((item, index) => {
							const isSelected = item.id === selectedItemId;
							return (
								// biome-ignore lint/a11y/useSemanticElements: APG Composite Grid Row
								<div
									key={item.id}
									ref={(node) => {
										if (node) {
											rowRefs.current.set(item.id, node);
										} else {
											rowRefs.current.delete(item.id);
										}
									}}
									role="row"
									tabIndex={isSelected ? 0 : -1}
									aria-selected={isSelected}
									onClick={() =>
										usePlaylistStore.getState().selectItem(item.id)
									}
									onKeyDown={(e) => handleRowKeyDown(e, item.id, index)}
									className={cn(
										"group flex items-center justify-between gap-2 rounded-md px-3 py-2 text-xs transition-colors",
										"focus-ring-inset select-none",
										isSelected
											? "bg-accent text-accent-foreground font-medium"
											: "hover:bg-muted/50 text-foreground",
									)}
								>
									{/* biome-ignore lint/a11y/useSemanticElements: APG Composite Grid Cell */}
									{/* biome-ignore lint/a11y/useFocusableInteractive: Row manages roving focus */}
									<div role="gridcell" className="min-w-0 flex-1 truncate">
										<span className="truncate">{item.title}</span>
									</div>

									{/* biome-ignore lint/a11y/useSemanticElements: APG Composite Grid Cell */}
									{/* biome-ignore lint/a11y/useFocusableInteractive: Child buttons receive roving focus */}
									<div
										ref={(node) => {
											if (node) {
												actionCellRefs.current.set(item.id, node);
											} else {
												actionCellRefs.current.delete(item.id);
											}
										}}
										role="gridcell"
										className="flex shrink-0 items-center gap-1"
										onKeyDown={(e) => handleActionCellKeyDown(e, item.id)}
										onClick={(e) => {
											// Stop click inside actions from bubbling to row select
											e.stopPropagation();
										}}
									>
										{mode === "view" ? (
											<Button
												variant="ghost"
												size="icon-xs"
												tabIndex={-1}
												title="Go Live"
												aria-label="Go Live"
												className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 text-muted-foreground hover:text-foreground"
											>
												<IconPlayerPlay className="size-3" />
											</Button>
										) : (
											<>
												<Button
													ref={(node) => {
														if (node) {
															moveUpRefs.current.set(item.id, node);
														} else {
															moveUpRefs.current.delete(item.id);
														}
													}}
													variant="ghost"
													size="icon-xs"
													tabIndex={-1}
													disabled={index === 0}
													title="Move up"
													aria-label="Move up"
													onClick={(e) => {
														e.stopPropagation();
														handleMoveUp(item.id, index);
													}}
												>
													<IconArrowUp className="size-3" />
												</Button>
												<Button
													ref={(node) => {
														if (node) {
															moveDownRefs.current.set(item.id, node);
														} else {
															moveDownRefs.current.delete(item.id);
														}
													}}
													variant="ghost"
													size="icon-xs"
													tabIndex={-1}
													disabled={index === items.length - 1}
													title="Move down"
													aria-label="Move down"
													onClick={(e) => {
														e.stopPropagation();
														handleMoveDown(item.id, index);
													}}
												>
													<IconArrowDown className="size-3" />
												</Button>
												<Button
													variant="ghost"
													size="icon-xs"
													tabIndex={-1}
													title="Edit item"
													aria-label="Edit item"
													onClick={(e) => {
														e.stopPropagation();
													}}
												>
													<IconPencil className="size-3" />
												</Button>
												<Button
													ref={(node) => {
														if (node) {
															deleteTriggerRefs.current.set(item.id, node);
														} else {
															deleteTriggerRefs.current.delete(item.id);
														}
													}}
													variant="ghost"
													size="icon-xs"
													tabIndex={-1}
													title="Delete item"
													aria-label="Delete item"
													className="text-destructive hover:bg-destructive/10 hover:text-destructive"
													onClick={(e) => {
														e.stopPropagation();
														handleOpenDelete(item.id, e.currentTarget);
													}}
												>
													<IconTrash className="size-3" />
												</Button>
											</>
										)}
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>

			{/* Singleton Delete Confirm Popover */}
			<Popover
				open={activeConfirmDeleteId !== null}
				onOpenChange={(nextOpen) => {
					if (!nextOpen) {
						handleCloseDelete();
					}
				}}
				modal="trap-focus"
			>
				<PopoverContent
					role="alertdialog"
					initialFocus={popoverCancelRef}
					data-item-id={activeConfirmDeleteId ?? undefined}
					anchor={activeAnchorElement}
					side="bottom"
					align="end"
					sideOffset={6}
					className="w-64 gap-3 p-3"
					onKeyDown={handlePopoverKeyDown}
				>
					<div className="flex flex-col gap-1">
						<PopoverTitle className="font-semibold text-foreground text-xs">
							Delete this item?
						</PopoverTitle>
						<PopoverDescription className="text-muted-foreground text-xs">
							Are you sure you want to delete this item?
						</PopoverDescription>
					</div>
					<div className="flex items-center justify-end gap-2 pt-2">
						<PopoverClose
							render={
								<Button
									ref={popoverCancelRef}
									type="button"
									variant="outline"
									size="sm"
									onClick={handleCloseDelete}
								>
									Cancel
								</Button>
							}
						/>
						<Button
							ref={popoverConfirmRef}
							type="button"
							variant="destructive"
							size="sm"
							onClick={handleConfirmDelete}
						>
							Delete
						</Button>
					</div>
				</PopoverContent>
			</Popover>
		</section>
	);
}
