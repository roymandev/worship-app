import { type KeyboardEvent, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverClose,
	PopoverContent,
	PopoverDescription,
	PopoverTitle,
} from "@/components/ui/popover";

type Props = {
	open: boolean;
	anchor: HTMLElement | null;
	itemId?: string | null;
	onConfirm: () => void;
	onClose: () => void;
};

export function PlaylistDeleteConfirmPopover({
	open,
	anchor,
	itemId,
	onConfirm,
	onClose,
}: Props) {
	const popoverCancelRef = useRef<HTMLButtonElement | null>(null);
	const popoverConfirmRef = useRef<HTMLButtonElement | null>(null);

	const handlePopoverKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
		if (e.key === "Escape") {
			e.stopPropagation();
			onClose();
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

	return (
		<Popover
			open={open}
			onOpenChange={(nextOpen) => {
				if (!nextOpen) {
					onClose();
				}
			}}
			modal="trap-focus"
		>
			<PopoverContent
				role="alertdialog"
				initialFocus={popoverCancelRef}
				data-item-id={itemId ?? undefined}
				anchor={anchor}
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
								onClick={onClose}
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
						onClick={onConfirm}
					>
						Delete
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
}
