import { IconAlertCircle, IconList, IconPlus } from "@tabler/icons-react";
import type * as React from "react";
import { useEffect, useRef } from "react";
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
	const {
		items,
		selectedItemId,
		editingItemId,
		activeConfirmDeleteId,
		hydrationStatus,
	} = usePlaylistStore(
		useShallow((s) => ({
			items: s.items,
			selectedItemId: s.selectedItemId,
			editingItemId: s.editingItemId,
			activeConfirmDeleteId: s.activeConfirmDeleteId,
			hydrationStatus: s.hydrationStatus,
		})),
	);

	const gridRef = useRef<HTMLDivElement | null>(null);
	const addButtonRef = useRef<HTMLButtonElement | null>(null);
	const emptyAddButtonRef = useRef<HTMLButtonElement | null>(null);

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

	const handleSelectNext = () => {
		usePlaylistStore.getState().selectNext();
		focusActiveRow();
	};

	const handleSelectPrevious = () => {
		usePlaylistStore.getState().selectPrevious();
		focusActiveRow();
	};

	const handleCloseDelete = () => {
		const currentActiveId = activeConfirmDeleteId;
		usePlaylistStore.getState().closeDeleteConfirm();
		if (currentActiveId) {
			requestAnimationFrame(() => {
				const row = gridRef.current?.querySelector<HTMLElement>(
					`[data-item-id="${currentActiveId}"]`,
				);
				row?.focus();
			});
		}
	};

	const handleConfirmDelete = () => {
		if (!activeConfirmDeleteId) return;
		const idToDelete = activeConfirmDeleteId;
		const isLastItem = items.length === 1;

		usePlaylistStore.getState().deleteItem(idToDelete);

		requestAnimationFrame(() => {
			if (isLastItem) {
				emptyAddButtonRef.current?.focus();
				return;
			}
			const targetId = usePlaylistStore.getState().selectedItemId;
			const activeRow = targetId
				? gridRef.current?.querySelector<HTMLElement>(
						`[data-item-id="${targetId}"]`,
					)
				: gridRef.current?.querySelector<HTMLElement>(
						'[role="row"][aria-selected="true"]',
					);
			if (activeRow) {
				activeRow.focus();
			} else {
				focusActiveRow();
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
	};

	// Determine dynamic popover anchor element via DOM delegation
	const activeAnchorElement = activeConfirmDeleteId
		? (gridRef.current?.querySelector<HTMLElement>(
				`[data-item-id="${activeConfirmDeleteId}"]`,
			) ?? null)
		: null;

	return (
		<section
			data-workspace-panel="playlist"
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
						ref={addButtonRef}
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
				</div>
			</header>

			<ContextMenu
				onOpenChange={(open) => {
					if (open) {
						usePlaylistStore.getState().closeDeleteConfirm();
					}
				}}
			>
				<ContextMenuTrigger className="flex min-h-0 flex-1 flex-col overflow-y-auto p-2">
					{hydrationStatus === "idle" || hydrationStatus === "hydrating" ? (
						<output
							aria-label="Loading playlist"
							className="flex flex-col gap-2 p-1"
						>
							<div className="h-9 w-full animate-pulse rounded bg-muted/50" />
							<div className="h-9 w-full animate-pulse rounded bg-muted/50" />
							<div className="h-9 w-full animate-pulse rounded bg-muted/50" />
						</output>
					) : hydrationStatus === "error" ? (
						<div
							role="alert"
							aria-label="Playlist error"
							className="flex flex-col items-center justify-center gap-3 p-6 text-center text-destructive"
						>
							<div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
								<IconAlertCircle className="size-4" />
							</div>
							<div className="flex flex-col gap-1">
								<h3 className="font-heading text-sm font-medium tracking-tight">
									Failed to load playlist
								</h3>
								<p className="text-muted-foreground text-xs">
									An error occurred while loading your saved playlist data.
								</p>
							</div>
						</div>
					) : items.length === 0 ? (
						<EmptyState
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
								const isEditing = item.id === editingItemId;
								return (
									<PlaylistItemRow
										key={item.id}
										item={item}
										index={index}
										totalItems={items.length}
										isSelected={isSelected}
										isEditing={isEditing}
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
