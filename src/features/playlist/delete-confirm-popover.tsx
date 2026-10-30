import type * as React from "react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverClose,
	PopoverContent,
	PopoverDescription,
	PopoverTitle,
	PopoverTrigger,
} from "@/components/ui/popover";

type PlaylistDeleteConfirmPopoverProps = {
	itemId: string;
	open?: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	trigger?: React.ReactElement | null;
	triggerRef?: React.RefObject<HTMLElement | null>;
	anchor?: React.RefObject<HTMLElement | null>;
};

export function PlaylistDeleteConfirmPopover({
	itemId,
	open = false,
	onOpenChange,
	onConfirm,
	trigger,
	triggerRef,
	anchor,
}: PlaylistDeleteConfirmPopoverProps) {
	const cancelButtonRef = useRef<HTMLButtonElement | null>(null);
	const confirmButtonRef = useRef<HTMLButtonElement | null>(null);

	const handleOpenChange = (nextOpen: boolean) => {
		onOpenChange(nextOpen);
		if (
			!nextOpen &&
			triggerRef?.current &&
			document.contains(triggerRef.current)
		) {
			triggerRef.current.focus();
		}
	};

	const handleCancel = () => {
		handleOpenChange(false);
	};

	const handleConfirm = () => {
		onOpenChange(false);
		onConfirm();
	};

	const popoverAnchor = anchor ?? triggerRef;

	return (
		<Popover open={open} onOpenChange={handleOpenChange} modal="trap-focus">
			{trigger ? <PopoverTrigger render={trigger} /> : null}
			<PopoverContent
				role="alertdialog"
				initialFocus={cancelButtonRef}
				data-item-id={itemId}
				anchor={trigger ? undefined : popoverAnchor}
				side="bottom"
				align="end"
				sideOffset={6}
				className="w-64 gap-3 p-3"
				onKeyDown={(e) => {
					if (e.key === "Escape") {
						e.stopPropagation();
						handleCancel();
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
						if (document.activeElement === cancelButtonRef.current) {
							confirmButtonRef.current?.focus();
						}
						return;
					}

					if (e.key === "ArrowLeft") {
						e.preventDefault();
						e.stopPropagation();
						if (document.activeElement === confirmButtonRef.current) {
							cancelButtonRef.current?.focus();
						}
						return;
					}

					if (e.key === "Tab") {
						e.stopPropagation();
						if (e.shiftKey) {
							if (document.activeElement !== confirmButtonRef.current) {
								e.preventDefault();
								confirmButtonRef.current?.focus();
							}
						} else {
							if (document.activeElement !== cancelButtonRef.current) {
								e.preventDefault();
								cancelButtonRef.current?.focus();
							}
						}
						return;
					}
				}}
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
								ref={cancelButtonRef}
								type="button"
								variant="outline"
								size="sm"
								onClick={handleCancel}
							>
								Cancel
							</Button>
						}
					/>
					<Button
						ref={confirmButtonRef}
						type="button"
						variant="destructive"
						size="sm"
						onClick={handleConfirm}
					>
						Delete
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
}
