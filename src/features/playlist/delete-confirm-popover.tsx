import type * as React from "react";
import { useEffect, useRef } from "react";
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

	// Automatically focus Cancel button upon opening for safety
	useEffect(() => {
		if (open) {
			const timer = setTimeout(() => {
				cancelButtonRef.current?.focus();
			}, 0);
			return () => clearTimeout(timer);
		}
	}, [open]);

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

					if (e.key === "Tab") {
						const container = e.currentTarget;
						const focusableElements = Array.from(
							container.querySelectorAll<HTMLElement>(
								'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
							),
						).filter(
							(el) =>
								el.offsetParent !== null || el.getClientRects().length >= 0,
						);

						if (focusableElements.length > 0) {
							const first = focusableElements[0];
							const last = focusableElements[focusableElements.length - 1];

							if (e.shiftKey) {
								if (document.activeElement === first) {
									e.preventDefault();
									e.stopPropagation();
									last.focus();
								}
							} else {
								if (document.activeElement === last) {
									e.preventDefault();
									e.stopPropagation();
									first.focus();
								}
							}
						}
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
