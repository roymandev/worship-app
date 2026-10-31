import { zodResolver } from "@hookform/resolvers/zod";
import { HotkeysProvider, useHotkey } from "@tanstack/react-hotkeys";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePlaylistStore } from "@/features/playlist/store";
import { appHotkeys } from "@/features/workspace/hotkeys";

export const playlistItemFormSchema = z.object({
	title: z.string().trim().min(1, "Title is required"),
	content: z.string().default(""),
});

export type PlaylistItemFormInput = z.input<typeof playlistItemFormSchema>;
export type PlaylistItemFormOutput = z.output<typeof playlistItemFormSchema>;

export const playlistItemFormDefaultValues: PlaylistItemFormInput = {
	title: "",
	content: "",
};

type EditorFormInnerProps = {
	itemId: string;
	isSwitchPending?: boolean;
	onConfirmDiscardSwitch?: () => void;
	onCancelSwitch?: () => void;
	onDirtyChange?: (isDirty: boolean) => void;
};

function EditorFormInner({
	itemId,
	isSwitchPending,
	onConfirmDiscardSwitch,
	onCancelSwitch,
	onDirtyChange,
}: EditorFormInnerProps) {
	const item = usePlaylistStore((state) =>
		state.items.find((i) => i.id === itemId),
	);
	const updateItem = usePlaylistStore((state) => state.updateItem);
	const stopEditingItem = usePlaylistStore((state) => state.stopEditingItem);

	const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);
	const titleInputRef = useRef<HTMLInputElement | null>(null);
	const lastFocusedElementRef = useRef<HTMLElement | null>(null);
	const discardTriggeredRef = useRef(false);

	const handleFocusIn = (e: React.FocusEvent<HTMLFormElement>) => {
		if (
			e.target instanceof HTMLInputElement ||
			e.target instanceof HTMLTextAreaElement
		) {
			lastFocusedElementRef.current = e.target;
		}
	};

	const form = useForm<PlaylistItemFormInput, unknown, PlaylistItemFormOutput>({
		resolver: zodResolver(playlistItemFormSchema),
		defaultValues: item
			? { title: item.title, content: item.content }
			: playlistItemFormDefaultValues,
	});

	const { isDirty, errors } = form.formState;

	useEffect(() => {
		onDirtyChange?.(isDirty);
	}, [isDirty, onDirtyChange]);

	useEffect(() => {
		if (!isDirty) return;

		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			e.preventDefault();
			e.returnValue = "";
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, [isDirty]);

	useEffect(() => {
		if (isSwitchPending) {
			lastFocusedElementRef.current =
				document.activeElement instanceof HTMLElement
					? document.activeElement
					: titleInputRef.current;
			setIsDiscardDialogOpen(true);
		}
	}, [isSwitchPending]);

	useEffect(() => {
		if (item) {
			form.reset({
				title: item.title,
				content: item.content,
			});
		} else {
			form.reset(playlistItemFormDefaultValues);
		}
	}, [item, form.reset]);

	useEffect(() => {
		titleInputRef.current?.focus();
	}, []);

	useEffect(() => {
		if (!item) {
			stopEditingItem();
		}
	}, [item, stopEditingItem]);

	const handleValidSubmit = (data: PlaylistItemFormOutput) => {
		onDirtyChange?.(false);
		form.reset(data);
		updateItem(itemId, data);
		stopEditingItem();
	};

	const attemptCancel = () => {
		if (isDiscardDialogOpen) return;
		if (isDirty) {
			if (!lastFocusedElementRef.current) {
				lastFocusedElementRef.current = titleInputRef.current;
			}
			setIsDiscardDialogOpen(true);
		} else {
			stopEditingItem();
		}
	};

	const handleConfirmDiscard = () => {
		discardTriggeredRef.current = true;
		setIsDiscardDialogOpen(false);
		form.reset();
		if (isSwitchPending && onConfirmDiscardSwitch) {
			onConfirmDiscardSwitch();
		} else {
			stopEditingItem();
		}
	};

	const handleCancelDiscardDialog = () => {
		setIsDiscardDialogOpen(false);
		if (isSwitchPending && onCancelSwitch) {
			onCancelSwitch();
		}
		const elementToFocus = lastFocusedElementRef.current;
		if (elementToFocus?.isConnected) {
			requestAnimationFrame(() => {
				elementToFocus.focus();
			});
		}
	};

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			if (discardTriggeredRef.current) {
				discardTriggeredRef.current = false;
				return;
			}
			handleCancelDiscardDialog();
		} else {
			setIsDiscardDialogOpen(true);
		}
	};

	useHotkey(
		appHotkeys["playlist.saveItem"],
		() => {
			void form.handleSubmit(handleValidSubmit)();
		},
		{ ignoreInputs: false },
	);

	useHotkey(
		appHotkeys["playlist.cancelEdit"],
		() => {
			if (isDiscardDialogOpen) return;
			attemptCancel();
		},
		{ ignoreInputs: false },
	);

	if (!item) {
		return null;
	}

	const titleRegister = form.register("title");
	const contentRegister = form.register("content");

	return (
		<form
			aria-label="Edit playlist item"
			onSubmit={form.handleSubmit(handleValidSubmit)}
			onFocus={handleFocusIn}
			className="flex h-full w-full flex-col gap-4 p-4"
		>
			<div className="flex flex-col gap-1.5">
				<label
					htmlFor="playlist-item-title"
					className="text-xs font-medium text-foreground"
				>
					Title
				</label>
				<Input
					id="playlist-item-title"
					{...titleRegister}
					ref={(node) => {
						titleRegister.ref(node);
						titleInputRef.current = node;
					}}
					placeholder="Item title"
					aria-invalid={!!errors.title}
					aria-describedby={
						errors.title ? "playlist-item-title-error" : undefined
					}
				/>
				{errors.title?.message && (
					<p
						id="playlist-item-title-error"
						role="alert"
						className="text-xs text-destructive"
					>
						{errors.title.message}
					</p>
				)}
			</div>

			<div className="flex flex-1 flex-col gap-1.5 min-h-0">
				<label
					htmlFor="playlist-item-content"
					className="text-xs font-medium text-foreground"
				>
					Content
				</label>
				<Textarea
					id="playlist-item-content"
					{...contentRegister}
					placeholder="Enter slide content or lyrics..."
					className="flex-1 resize-none"
				/>
			</div>

			<div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={attemptCancel}
				>
					Cancel
				</Button>
				<Button type="submit" size="sm">
					Save
				</Button>
			</div>

			<AlertDialog open={isDiscardDialogOpen} onOpenChange={handleOpenChange}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
						<AlertDialogDescription>
							Unsaved edits to this playlist item will be lost.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={handleCancelDiscardDialog}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							onClick={handleConfirmDiscard}
						>
							Discard
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</form>
	);
}

export function PlaylistItemEditor() {
	const editingItemId = usePlaylistStore((state) => state.editingItemId);
	const startEditingItem = usePlaylistStore((state) => state.startEditingItem);
	const stopEditingItem = usePlaylistStore((state) => state.stopEditingItem);

	const [displayedItemId, setDisplayedItemId] = useState<string | null>(
		editingItemId,
	);
	const displayedItemIdRef = useRef<string | null>(editingItemId);
	const [pendingTargetId, setPendingTargetId] = useState<string | null>(null);
	const [isSwitchPending, setIsSwitchPending] = useState(false);

	const isDirtyRef = useRef(false);

	const callerElementRef = useRef<HTMLElement | null>(
		typeof document !== "undefined" &&
			document.activeElement instanceof HTMLElement
			? document.activeElement
			: null,
	);

	useEffect(() => {
		const currentDisplayed = displayedItemIdRef.current;
		if (editingItemId === currentDisplayed) {
			return;
		}

		if (isDirtyRef.current) {
			setPendingTargetId(editingItemId);
			setIsSwitchPending(true);
		} else {
			displayedItemIdRef.current = editingItemId;
			setDisplayedItemId(editingItemId);
			setPendingTargetId(null);
			setIsSwitchPending(false);
		}
	}, [editingItemId]);

	const handleConfirmDiscardSwitch = () => {
		setIsSwitchPending(false);
		isDirtyRef.current = false;
		const target = pendingTargetId;
		setPendingTargetId(null);
		displayedItemIdRef.current = target;
		setDisplayedItemId(target);
		if (target) {
			startEditingItem(target);
		} else {
			stopEditingItem();
		}
	};

	const handleCancelSwitch = () => {
		setIsSwitchPending(false);
		setPendingTargetId(null);
		// Revert store editingItemId back to current displayed item
		if (displayedItemIdRef.current) {
			startEditingItem(displayedItemIdRef.current);
		}
	};

	useEffect(() => {
		return () => {
			// In in-app switching, editingItemId is already updated or pending to a new ID.
			// Focus restoration to the playlist row should only run when the editor unmounts completely
			// (i.e. editing has stopped / editingItemId is null).
			const storeEditingId = usePlaylistStore.getState().editingItemId;
			if (
				storeEditingId !== null &&
				storeEditingId !== displayedItemIdRef.current
			) {
				return;
			}
			const lastId = displayedItemIdRef.current;
			if (!lastId) return;

			const rowElement =
				document.querySelector<HTMLElement>(
					`[role="row"][data-item-id="${lastId}"]`,
				) ??
				document.querySelector<HTMLElement>(
					'[role="row"][aria-selected="true"]',
				);

			if (rowElement?.isConnected) {
				rowElement.focus();
			} else if (callerElementRef.current?.isConnected) {
				callerElementRef.current.focus();
			}
		};
	}, []);

	if (!displayedItemId) {
		return null;
	}

	return (
		<HotkeysProvider scope="playlist:item-editor" exclusive>
			<EditorFormInner
				itemId={displayedItemId}
				isSwitchPending={isSwitchPending}
				onConfirmDiscardSwitch={handleConfirmDiscardSwitch}
				onCancelSwitch={handleCancelSwitch}
				onDirtyChange={(dirty) => {
					isDirtyRef.current = dirty;
				}}
			/>
		</HotkeysProvider>
	);
}
