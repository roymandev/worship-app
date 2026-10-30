import { IconList, IconPlus } from "@tabler/icons-react";
import { useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { RowList } from "@/components/row-list";
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

	const organizeButtonRef = useRef<HTMLButtonElement | null>(null);
	const emptyAddButtonRef = useRef<HTMLButtonElement | null>(null);

	const isEditMode = mode === "edit";

	const handleAdd = () => {
		usePlaylistStore.getState().addItem();
		requestAnimationFrame(() => {
			const activeRow = document.querySelector<HTMLElement>(
				'[role="row"][aria-selected="true"]',
			);
			activeRow?.focus();
		});
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
			} else {
				const activeRow =
					document.querySelector<HTMLElement>(
						'[role="row"][aria-selected="true"]',
					) ?? document.querySelector<HTMLElement>('[role="row"]');
				activeRow?.focus();
			}
		});
	};

	return (
		<section
			aria-label="Playlist panel"
			className="flex h-full w-full flex-col overflow-hidden bg-background text-foreground"
			onKeyDown={(e) => {
				if (e.key === "Escape" && isEditMode) {
					e.preventDefault();
					usePlaylistStore.getState().setMode("view");
					requestAnimationFrame(() => {
						const activeRow = document.querySelector<HTMLElement>(
							'[role="row"][aria-selected="true"]',
						);
						if (activeRow) {
							activeRow.focus();
						} else {
							organizeButtonRef.current?.focus();
						}
					});
				}
			}}
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
					<RowList
						items={items}
						selectedId={selectedItemId}
						onSelect={(item) => usePlaylistStore.getState().selectItem(item.id)}
						getKey={(item) => item.id}
						ariaLabel="Playlist items"
						className="flex flex-col gap-1"
						onRowKeyDown={(item, e) => {
							const itemIndex = items.findIndex((i) => i.id === item.id);
							const isFirst = itemIndex === 0;
							const isLast = itemIndex === items.length - 1;

							if (e.altKey && e.key === "ArrowUp") {
								e.preventDefault();
								e.stopPropagation();
								if (!isFirst) {
									usePlaylistStore.getState().moveItemUp(item.id);
								}
								return;
							}

							if (e.altKey && e.key === "ArrowDown") {
								e.preventDefault();
								e.stopPropagation();
								if (!isLast) {
									usePlaylistStore.getState().moveItemDown(item.id);
								}
								return;
							}

							if (e.key === "Backspace" || e.key === "Delete") {
								e.preventDefault();
								e.stopPropagation();
								usePlaylistStore.getState().openDeleteConfirm(item.id);
								return;
							}

							if (e.key === "ArrowRight") {
								const rowEl = e.currentTarget;
								const firstButton = rowEl.querySelector<HTMLButtonElement>(
									'div[role="gridcell"] button:not([disabled])',
								);
								if (firstButton) {
									e.preventDefault();
									e.stopPropagation();
									firstButton.focus();
								}
							}
						}}
						renderRow={(item, { isSelected, isFocused }) => {
							const itemIndex = items.findIndex((i) => i.id === item.id);
							return (
								<PlaylistItemRow
									item={item}
									isSelected={isSelected}
									isFocused={isFocused}
									isFirst={itemIndex === 0}
									isLast={itemIndex === items.length - 1}
									mode={mode}
									open={activeConfirmDeleteId === item.id}
									onDeleteConfirmOpenChange={(open) => {
										if (open) {
											usePlaylistStore.getState().openDeleteConfirm(item.id);
										} else {
											usePlaylistStore.getState().closeDeleteConfirm();
										}
									}}
									onSelect={() =>
										usePlaylistStore.getState().selectItem(item.id)
									}
									onMoveUp={() =>
										usePlaylistStore.getState().moveItemUp(item.id)
									}
									onMoveDown={() =>
										usePlaylistStore.getState().moveItemDown(item.id)
									}
									onDelete={() => handleDeleteItem(item.id)}
									asCellContent
								/>
							);
						}}
					/>
				)}
			</div>
		</section>
	);
}
