import {
	IconArrowDown,
	IconArrowUp,
	IconPencil,
	IconPlayerPlay,
	IconTrash,
} from "@tabler/icons-react";
import { cn } from "cn";
import type * as React from "react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlaylistDeleteConfirmPopover } from "@/features/playlist/delete-confirm-popover";
import type { PlaylistItem, PlaylistMode } from "@/features/playlist/store";

export type PlaylistItemRowProps = {
	item: PlaylistItem;
	isSelected: boolean;
	isFocused?: boolean;
	isFirst?: boolean;
	isLast?: boolean;
	mode: PlaylistMode;
	open?: boolean;
	onDeleteConfirmOpenChange?: (open: boolean) => void;
	onSelect: () => void;
	onMoveUp: () => void;
	onMoveDown: () => void;
	onDelete: () => void;
	asCellContent?: boolean;
};

export function PlaylistItemRow({
	item,
	isSelected,
	isFocused: _isFocused = false,
	isFirst = false,
	isLast = false,
	mode,
	open,
	onDeleteConfirmOpenChange,
	onSelect,
	onMoveUp,
	onMoveDown,
	onDelete,
	asCellContent = false,
}: PlaylistItemRowProps) {
	const rowRef = useRef<HTMLDivElement | null>(null);
	const deleteTriggerRef = useRef<HTMLButtonElement | null>(null);
	const actionCellRef = useRef<HTMLDivElement | null>(null);
	const moveUpRef = useRef<HTMLButtonElement | null>(null);
	const moveDownRef = useRef<HTMLButtonElement | null>(null);
	const [localDeleteDialogOpen, setLocalDeleteDialogOpen] = useState(false);

	const isConfirmOpen = open !== undefined ? open : localDeleteDialogOpen;

	const handleOpenChange = (open: boolean) => {
		if (onDeleteConfirmOpenChange) {
			onDeleteConfirmOpenChange(open);
		} else {
			setLocalDeleteDialogOpen(open);
		}
	};

	const rowTargetRef = useRef<HTMLElement | null>(null);

	const focusRow = () => {
		const row =
			rowRef.current?.closest<HTMLElement>('[role="row"]') ?? rowRef.current;
		row?.focus();
	};

	const handleRowKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		// Alt+ArrowUp: Move Up
		if (e.altKey && e.key === "ArrowUp") {
			e.preventDefault();
			e.stopPropagation();
			if (!isFirst) {
				onMoveUp();
			}
			return;
		}

		// Alt+ArrowDown: Move Down
		if (e.altKey && e.key === "ArrowDown") {
			e.preventDefault();
			e.stopPropagation();
			if (!isLast) {
				onMoveDown();
			}
			return;
		}

		// Backspace or Delete: trigger delete confirm popover
		if (e.key === "Backspace" || e.key === "Delete") {
			e.preventDefault();
			e.stopPropagation();
			rowTargetRef.current =
				rowRef.current?.closest<HTMLElement>('[role="row"]') ?? rowRef.current;
			handleOpenChange(true);
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
	};

	const handleMoveUpClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onMoveUp();
		requestAnimationFrame(() => {
			if (moveDownRef.current && !moveDownRef.current.disabled) {
				moveDownRef.current.focus();
			} else {
				focusRow();
			}
		});
	};

	const handleMoveDownClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onMoveDown();
		requestAnimationFrame(() => {
			if (moveUpRef.current && !moveUpRef.current.disabled) {
				moveUpRef.current.focus();
			} else {
				focusRow();
			}
		});
	};

	const handleActionCellKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		const enabledButtons = Array.from(
			actionCellRef.current?.querySelectorAll<HTMLButtonElement>(
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
				focusRow();
			}
			return;
		}

		if (e.key === "Escape") {
			e.preventDefault();
			e.stopPropagation();
			focusRow();
			return;
		}
	};

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: Keyboard and click handled for standalone row
		// biome-ignore lint/a11y/useAriaPropsSupportedByRole: Dynamic role support for composite grid
		<div
			ref={rowRef}
			role={asCellContent ? undefined : "row"}
			tabIndex={asCellContent ? undefined : isSelected ? 0 : -1}
			aria-selected={asCellContent ? undefined : isSelected}
			onClick={onSelect}
			onKeyDown={handleRowKeyDown}
			className={cn(
				"group flex items-center justify-between gap-2 rounded-md px-3 py-2 text-xs transition-colors",
				!asCellContent && "focus-ring-inset",
				"select-none",
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
				ref={actionCellRef}
				role="gridcell"
				className="flex shrink-0 items-center gap-1"
				onKeyDown={handleActionCellKeyDown}
				onClick={(e) => {
					// Stop click inside actions from bubbling to row select
					e.stopPropagation();
				}}
			>
				{mode === "view" ? (
					<>
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
						<PlaylistDeleteConfirmPopover
							itemId={item.id}
							open={isConfirmOpen}
							onOpenChange={handleOpenChange}
							onConfirm={onDelete}
							triggerRef={rowTargetRef}
							trigger={null}
						/>
					</>
				) : (
					<>
						<Button
							ref={moveUpRef}
							variant="ghost"
							size="icon-xs"
							tabIndex={-1}
							disabled={isFirst}
							title="Move up"
							aria-label="Move up"
							onClick={handleMoveUpClick}
						>
							<IconArrowUp className="size-3" />
						</Button>
						<Button
							ref={moveDownRef}
							variant="ghost"
							size="icon-xs"
							tabIndex={-1}
							disabled={isLast}
							title="Move down"
							aria-label="Move down"
							onClick={handleMoveDownClick}
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
						<PlaylistDeleteConfirmPopover
							itemId={item.id}
							open={isConfirmOpen}
							onOpenChange={handleOpenChange}
							onConfirm={onDelete}
							triggerRef={deleteTriggerRef}
							trigger={
								<Button
									ref={deleteTriggerRef}
									variant="ghost"
									size="icon-xs"
									tabIndex={-1}
									title="Delete item"
									aria-label="Delete item"
									className="text-destructive hover:bg-destructive/10 hover:text-destructive"
								>
									<IconTrash className="size-3" />
								</Button>
							}
						/>
					</>
				)}
			</div>
		</div>
	);
}
