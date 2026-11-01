import {
	IconArrowDown,
	IconArrowUp,
	IconPencil,
	IconPlayerPlay,
	IconPlus,
	IconTrash,
	IconVideo,
} from "@tabler/icons-react";
import { cn } from "cn";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuShortcut,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { type PlaylistItem, usePlaylistStore } from "@/features/playlist/store";
import { HotkeyChordKbd } from "@/features/workspace/app-hotkey-kbd";

type Props = {
	item: PlaylistItem;
	index: number;
	totalItems: number;
	isSelected: boolean;
	isEditing?: boolean;
};

export function PlaylistItemRow({
	item,
	index,
	totalItems,
	isSelected,
	isEditing = false,
}: Props) {
	const localRowRef = useRef<HTMLDivElement | null>(null);
	const actionCellRef = useRef<HTMLDivElement | null>(null);
	const isLive = usePlaylistStore((s) => s.liveItemId === item.id);

	const handleGoLive = () => {
		if (isLive) return;
		usePlaylistStore.getState().goLive(item.id);
		requestAnimationFrame(() => {
			const activeCueRow = document.querySelector<HTMLElement>(
				'[role="grid"][aria-label="Live cue items"] [role="row"][aria-selected="true"]',
			);
			activeCueRow?.focus();
		});
	};

	const handleMoveUp = () => {
		if (index > 0) {
			usePlaylistStore.getState().moveItemUp(item.id);
			requestAnimationFrame(() => {
				localRowRef.current?.focus();
			});
		}
	};

	const handleMoveDown = () => {
		if (index < totalItems - 1) {
			usePlaylistStore.getState().moveItemDown(item.id);
			requestAnimationFrame(() => {
				localRowRef.current?.focus();
			});
		}
	};

	const handleRowKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		// Shift+F10: Open context menu for this item
		if (e.shiftKey && e.key === "F10") {
			e.preventDefault();
			e.stopPropagation();
			usePlaylistStore.getState().selectItem(item.id);
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
			if (index > 0) {
				e.preventDefault();
				e.stopPropagation();
				handleMoveUp();
			}
			return;
		}

		// Alt+ArrowDown: Move Down
		if (e.altKey && e.key === "ArrowDown") {
			if (index < totalItems - 1) {
				e.preventDefault();
				e.stopPropagation();
				handleMoveDown();
			}
			return;
		}

		// Backspace or Delete: trigger delete confirm popover
		if (e.key === "Backspace" || e.key === "Delete") {
			e.preventDefault();
			e.stopPropagation();
			usePlaylistStore.getState().openDeleteConfirm(item.id);
			return;
		}

		// F2: start editing item
		if (
			!e.altKey &&
			!e.ctrlKey &&
			!e.metaKey &&
			!e.shiftKey &&
			e.key === "F2"
		) {
			e.preventDefault();
			e.stopPropagation();
			usePlaylistStore.getState().startEditingItem(item.id);
			return;
		}

		// Enter: Go Live (if not already live)
		if (
			!e.altKey &&
			!e.ctrlKey &&
			!e.metaKey &&
			!e.shiftKey &&
			e.key === "Enter"
		) {
			if (!isLive) {
				e.preventDefault();
				e.stopPropagation();
				handleGoLive();
			}
			return;
		}

		// ArrowRight: focus the first interactive button in the action cell
		if (e.key === "ArrowRight") {
			const firstButton =
				actionCellRef.current?.querySelector<HTMLButtonElement>(
					"button:not([disabled])",
				);
			if (firstButton) {
				e.preventDefault();
				e.stopPropagation();
				firstButton.focus();
			}
			return;
		}

		// ArrowUp and ArrowDown bubble up to PlaylistPanel (APG Composite Grid)
	};

	const handleActionCellKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (e.shiftKey && e.key === "Tab") {
			// Allow standard Shift+Tab to bubble or let grid/panel handle
			return;
		}

		const enabledButtons = Array.from(
			actionCellRef.current?.querySelectorAll<HTMLButtonElement>(
				"button:not([disabled])",
			) ?? [],
		);
		const currentIndex = enabledButtons.indexOf(
			document.activeElement as HTMLButtonElement,
		);

		if (e.key === "ArrowRight") {
			e.preventDefault();
			e.stopPropagation();
			if (currentIndex !== -1 && currentIndex < enabledButtons.length - 1) {
				enabledButtons[currentIndex + 1].focus();
			}
			return;
		}

		if (e.key === "ArrowLeft") {
			e.preventDefault();
			e.stopPropagation();
			if (currentIndex > 0) {
				enabledButtons[currentIndex - 1].focus();
			} else {
				localRowRef.current?.focus();
			}
			return;
		}

		if (e.key === "Escape") {
			e.preventDefault();
			e.stopPropagation();
			localRowRef.current?.focus();
			return;
		}

		// ArrowDown and ArrowUp bubble up to PlaylistPanel
	};

	return (
		<ContextMenu
			onOpenChange={(open) => {
				if (open) {
					usePlaylistStore.getState().selectItem(item.id);
					usePlaylistStore.getState().closeDeleteConfirm();
				} else {
					localRowRef.current?.focus();
				}
			}}
		>
			<ContextMenuTrigger
				render={
					// biome-ignore lint/a11y/useSemanticElements: APG Composite Grid Row
					<div
						ref={localRowRef}
						role="row"
						data-item-id={item.id}
						data-editing={isEditing ? "true" : undefined}
						data-live={isLive ? "true" : undefined}
						tabIndex={isSelected ? 0 : -1}
						aria-selected={isSelected}
						onClick={() => {
							usePlaylistStore.getState().selectItem(item.id);
							usePlaylistStore.getState().closeDeleteConfirm();
						}}
						onDoubleClick={() => {
							handleGoLive();
						}}
						onKeyDown={handleRowKeyDown}
						className={cn(
							"group flex items-center justify-between gap-2 rounded-md px-3 py-2 text-xs transition-colors",
							"focus-ring-inset select-none",
							isSelected
								? "bg-accent text-accent-foreground font-medium"
								: "hover:bg-muted/50 text-foreground",
						)}
					/>
				}
			>
				{/* biome-ignore lint/a11y/useSemanticElements: APG Composite Grid Cell */}
				{/* biome-ignore lint/a11y/useFocusableInteractive: Row manages roving focus */}
				<div
					role="gridcell"
					className="flex min-w-0 flex-1 items-center gap-1.5 truncate"
				>
					<span className="truncate">{item.title}</span>
				</div>

				{/* biome-ignore lint/a11y/useSemanticElements: APG Composite Grid Cell */}
				{/* biome-ignore lint/a11y/useFocusableInteractive: Child buttons receive roving focus */}
				<div
					ref={actionCellRef}
					role="gridcell"
					data-action-cell={item.id}
					className="flex shrink-0 items-center gap-1"
					onKeyDown={handleActionCellKeyDown}
					onClick={(e) => {
						e.stopPropagation();
					}}
				>
					{isEditing && (
						// biome-ignore lint/a11y/useSemanticElements: ARIA live status indicator inside gridcell
						<span
							role="status"
							aria-label="Currently editing in item editor"
							title="Currently editing in item editor"
							data-editing-indicator="true"
							className="flex size-5 items-center justify-center text-amber-500 dark:text-amber-400"
						>
							<IconPencil className="size-3.5 shrink-0" />
							<span className="sr-only">(editing)</span>
						</span>
					)}

					{isLive ? (
						// biome-ignore lint/a11y/useSemanticElements: ARIA live status indicator inside gridcell
						<span
							role="status"
							aria-label="Currently live in presentation"
							title="Currently live in presentation"
							data-live-indicator="true"
							className="flex size-5 items-center justify-center text-destructive"
						>
							<IconVideo className="size-3.5 shrink-0" />
							<span className="sr-only">(live)</span>
						</span>
					) : (
						<Button
							variant="ghost"
							size="icon-xs"
							tabIndex={-1}
							title="Go Live"
							aria-label="Go Live"
							onClick={handleGoLive}
							className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 text-muted-foreground hover:text-foreground transition-opacity"
						>
							<IconPlayerPlay className="size-3.5" />
						</Button>
					)}
				</div>
			</ContextMenuTrigger>

			<ContextMenuContent>
				<ContextMenuItem
					disabled={isLive}
					onClick={() => {
						handleGoLive();
					}}
				>
					<IconPlayerPlay />
					<span>Go Live</span>
				</ContextMenuItem>
				<ContextMenuItem
					onClick={() => {
						usePlaylistStore.getState().startEditingItem(item.id);
					}}
				>
					<IconPencil />
					<span>Edit Item</span>
					<ContextMenuShortcut>
						<HotkeyChordKbd chord="F2" />
					</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuItem
					disabled={index === 0}
					onClick={() => {
						usePlaylistStore.getState().moveItemUp(item.id);
					}}
				>
					<IconArrowUp />
					<span>Move Up</span>
					<ContextMenuShortcut>
						<HotkeyChordKbd chord="Alt+ArrowUp" />
					</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuItem
					disabled={index === totalItems - 1}
					onClick={() => {
						usePlaylistStore.getState().moveItemDown(item.id);
					}}
				>
					<IconArrowDown />
					<span>Move Down</span>
					<ContextMenuShortcut>
						<HotkeyChordKbd chord="Alt+ArrowDown" />
					</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuItem
					variant="destructive"
					onClick={() => {
						usePlaylistStore.getState().openDeleteConfirm(item.id);
					}}
				>
					<IconTrash />
					<span>Delete Item</span>
					<ContextMenuShortcut>
						<HotkeyChordKbd chord="Del" />
					</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuSeparator />
				<ContextMenuItem
					onClick={() => {
						usePlaylistStore.getState().insertItemAfter(item.id);
					}}
				>
					<IconPlus />
					<span>Add Item</span>
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
}
