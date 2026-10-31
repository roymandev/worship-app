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
import {
	type PlaylistItem,
	type PlaylistMode,
	usePlaylistStore,
} from "@/features/playlist/store";

type Props = {
	item: PlaylistItem;
	index: number;
	totalItems: number;
	isSelected: boolean;
	mode: PlaylistMode;
	onRegisterRow?: (id: string, el: HTMLDivElement | null) => void;
	onRegisterActionCell?: (id: string, el: HTMLDivElement | null) => void;
	onRegisterMoveUp?: (id: string, el: HTMLButtonElement | null) => void;
	onRegisterMoveDown?: (id: string, el: HTMLButtonElement | null) => void;
	onRegisterDeleteTrigger?: (id: string, el: HTMLButtonElement | null) => void;
	onMoveUp?: (id: string, index: number) => void;
	onMoveDown?: (id: string, index: number) => void;
	onRequestDelete?: (id: string, triggerElement: HTMLElement | null) => void;
	onKeyDown?: (
		e: React.KeyboardEvent<HTMLDivElement>,
		id: string,
		index: number,
	) => void;
	onActionCellKeyDown?: (
		e: React.KeyboardEvent<HTMLDivElement>,
		id: string,
	) => void;
};

export function PlaylistItemRow({
	item,
	index,
	totalItems,
	isSelected,
	mode,
	onRegisterRow,
	onRegisterActionCell,
	onRegisterMoveUp,
	onRegisterMoveDown,
	onRegisterDeleteTrigger,
	onMoveUp,
	onMoveDown,
	onRequestDelete,
	onKeyDown,
	onActionCellKeyDown,
}: Props) {
	const localRowRef = useRef<HTMLDivElement | null>(null);

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
						ref={(el) => {
							localRowRef.current = el;
							onRegisterRow?.(item.id, el);
						}}
						role="row"
						data-item-id={item.id}
						tabIndex={isSelected ? 0 : -1}
						aria-selected={isSelected}
						onClick={() => {
							usePlaylistStore.getState().selectItem(item.id);
							usePlaylistStore.getState().closeDeleteConfirm();
						}}
						onKeyDown={(e) => onKeyDown?.(e, item.id, index)}
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
				<div role="gridcell" className="min-w-0 flex-1 truncate">
					<span className="truncate">{item.title}</span>
				</div>

				{/* biome-ignore lint/a11y/useSemanticElements: APG Composite Grid Cell */}
				{/* biome-ignore lint/a11y/useFocusableInteractive: Child buttons receive roving focus */}
				<div
					ref={(el) => {
						onRegisterActionCell?.(item.id, el);
					}}
					role="gridcell"
					className="flex shrink-0 items-center gap-1"
					onKeyDown={(e) => onActionCellKeyDown?.(e, item.id)}
					onClick={(e) => {
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
								ref={(el) => {
									onRegisterMoveUp?.(item.id, el);
								}}
								variant="ghost"
								size="icon-xs"
								tabIndex={-1}
								disabled={index === 0}
								title="Move up"
								aria-label="Move up"
								onClick={(e) => {
									e.stopPropagation();
									onMoveUp?.(item.id, index);
								}}
							>
								<IconArrowUp className="size-3" />
							</Button>
							<Button
								ref={(el) => {
									onRegisterMoveDown?.(item.id, el);
								}}
								variant="ghost"
								size="icon-xs"
								tabIndex={-1}
								disabled={index === totalItems - 1}
								title="Move down"
								aria-label="Move down"
								onClick={(e) => {
									e.stopPropagation();
									onMoveDown?.(item.id, index);
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
									usePlaylistStore.getState().startEditingItem(item.id);
								}}
							>
								<IconPencil className="size-3" />
							</Button>
							<Button
								ref={(el) => {
									onRegisterDeleteTrigger?.(item.id, el);
								}}
								variant="ghost"
								size="icon-xs"
								tabIndex={-1}
								title="Delete item"
								aria-label="Delete item"
								className="text-destructive hover:bg-destructive/10 hover:text-destructive"
								onClick={(e) => {
									e.stopPropagation();
									onRequestDelete?.(item.id, e.currentTarget);
								}}
							>
								<IconTrash className="size-3" />
							</Button>
						</>
					)}
				</div>
			</ContextMenuTrigger>

			<ContextMenuContent>
				<ContextMenuItem onClick={() => {}}>
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
					<ContextMenuShortcut>E</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuItem
					disabled={index === 0}
					onClick={() => {
						onMoveUp?.(item.id, index);
					}}
				>
					<IconArrowUp />
					<span>Move Up</span>
					<ContextMenuShortcut>Alt+↑</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuItem
					disabled={index === totalItems - 1}
					onClick={() => {
						onMoveDown?.(item.id, index);
					}}
				>
					<IconArrowDown />
					<span>Move Down</span>
					<ContextMenuShortcut>Alt+↓</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuItem
					variant="destructive"
					onClick={() => {
						onRequestDelete?.(item.id, localRowRef.current);
					}}
				>
					<IconTrash />
					<span>Delete Item</span>
					<ContextMenuShortcut>Del</ContextMenuShortcut>
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
				<ContextMenuItem
					onClick={() => {
						usePlaylistStore.getState().toggleMode();
					}}
				>
					<IconList />
					<span>
						{mode === "edit" ? "Done Organizing" : "Organize Playlist"}
					</span>
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
}
