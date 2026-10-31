import { IconList, IconPlus } from "@tabler/icons-react";
import type * as React from "react";
import { useCallback, useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { EmptyState } from "@/components/ui/empty";
import { PlaylistDeleteConfirmPopover } from "@/features/playlist/delete-confirm-popover";
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

	// Direct references to rows and action buttons for precise focus management
	const rowRefs = useRef<Map<string, HTMLDivElement>>(new Map());
	const actionCellRefs = useRef<Map<string, HTMLDivElement>>(new Map());
	const moveUpRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
	const moveDownRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
	const deleteTriggerRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

	// Track the element that triggered the delete popover to restore focus upon cancel/dismiss
	const deleteTriggerOriginRef = useRef<HTMLElement | null>(null);

	const handleRegisterRow = useCallback(
		(id: string, el: HTMLDivElement | null) => {
			if (el) rowRefs.current.set(id, el);
			else rowRefs.current.delete(id);
		},
		[],
	);

	const handleRegisterActionCell = useCallback(
		(id: string, el: HTMLDivElement | null) => {
			if (el) actionCellRefs.current.set(id, el);
			else actionCellRefs.current.delete(id);
		},
		[],
	);

	const handleRegisterMoveUp = useCallback(
		(id: string, el: HTMLButtonElement | null) => {
			if (el) moveUpRefs.current.set(id, el);
			else moveUpRefs.current.delete(id);
		},
		[],
	);

	const handleRegisterMoveDown = useCallback(
		(id: string, el: HTMLButtonElement | null) => {
			if (el) moveDownRefs.current.set(id, el);
			else moveDownRefs.current.delete(id);
		},
		[],
	);

	const handleRegisterDeleteTrigger = useCallback(
		(id: string, el: HTMLButtonElement | null) => {
			if (el) deleteTriggerRefs.current.set(id, el);
			else deleteTriggerRefs.current.delete(id);
		},
		[],
	);

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
		// Shift+F10: Open context menu for this item
		if (e.shiftKey && e.key === "F10") {
			e.preventDefault();
			e.stopPropagation();
			usePlaylistStore.getState().selectItem(id);
			usePlaylistStore.getState().closeDeleteConfirm();
			const rect = e.currentTarget.getBoundingClientRect();
			const contextMenuEvent = new MouseEvent("contextmenu", {
				bubbles: true,
				cancelable: true,
				clientX: rect.left + rect.width / 2,
				clientY: rect.top + rect.height / 2,
			});
			e.currentTarget.dispatchEvent(contextMenuEvent);
			return;
		}

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

		if (
			!e.altKey &&
			!e.ctrlKey &&
			!e.metaKey &&
			(e.key === "e" || e.key === "E")
		) {
			e.preventDefault();
			e.stopPropagation();
			usePlaylistStore.getState().startEditingItem(id);
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

			<ContextMenu
				onOpenChange={(open) => {
					if (open) {
						usePlaylistStore.getState().closeDeleteConfirm();
					}
				}}
			>
				<ContextMenuTrigger
					data-testid="playlist-viewport"
					className="min-h-0 flex-1 overflow-y-auto p-2"
				>
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
									<PlaylistItemRow
										key={item.id}
										item={item}
										index={index}
										totalItems={items.length}
										isSelected={isSelected}
										mode={mode}
										onRegisterRow={handleRegisterRow}
										onRegisterActionCell={handleRegisterActionCell}
										onRegisterMoveUp={handleRegisterMoveUp}
										onRegisterMoveDown={handleRegisterMoveDown}
										onRegisterDeleteTrigger={handleRegisterDeleteTrigger}
										onMoveUp={handleMoveUp}
										onMoveDown={handleMoveDown}
										onRequestDelete={handleOpenDelete}
										onKeyDown={handleRowKeyDown}
										onActionCellKeyDown={handleActionCellKeyDown}
									/>
								);
							})}
						</div>
					)}
				</ContextMenuTrigger>
				<ContextMenuContent>
					<ContextMenuItem
						onClick={() => {
							handleAdd();
						}}
					>
						<IconPlus />
						<span>Add Item</span>
					</ContextMenuItem>
					<ContextMenuItem
						disabled={items.length === 0}
						onClick={() => {
							handleToggleMode();
						}}
					>
						<IconList />
						<span>{isEditMode ? "Done Organizing" : "Organize Playlist"}</span>
					</ContextMenuItem>
				</ContextMenuContent>
			</ContextMenu>

			<PlaylistDeleteConfirmPopover
				open={activeConfirmDeleteId !== null}
				anchor={activeAnchorElement}
				itemId={activeConfirmDeleteId}
				onConfirm={handleConfirmDelete}
				onClose={handleCloseDelete}
			/>
		</section>
	);
}
