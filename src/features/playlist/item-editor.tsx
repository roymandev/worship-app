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

export type PlaylistItemEditorProps = {
	itemId: string;
};

type EditorFormInnerProps = {
	itemId: string;
};

function EditorFormInner({ itemId }: EditorFormInnerProps) {
	const item = usePlaylistStore((state) =>
		state.items.find((i) => i.id === itemId),
	);
	const updateItem = usePlaylistStore((state) => state.updateItem);
	const stopEditingItem = usePlaylistStore((state) => state.stopEditingItem);

	const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);
	const titleInputRef = useRef<HTMLInputElement | null>(null);

	const form = useForm<PlaylistItemFormInput, unknown, PlaylistItemFormOutput>({
		resolver: zodResolver(playlistItemFormSchema),
		defaultValues: item
			? { title: item.title, content: item.content }
			: playlistItemFormDefaultValues,
	});

	const currentItemIdRef = useRef(itemId);

	useEffect(() => {
		if (currentItemIdRef.current !== itemId) {
			currentItemIdRef.current = itemId;
			if (item) {
				form.reset({
					title: item.title,
					content: item.content,
				});
			} else {
				form.reset(playlistItemFormDefaultValues);
			}
		}
	}, [itemId, item, form.reset]);

	useEffect(() => {
		titleInputRef.current?.focus();
	}, []);

	useEffect(() => {
		if (!item) {
			stopEditingItem();
		}
	}, [item, stopEditingItem]);

	const handleValidSubmit = (data: PlaylistItemFormOutput) => {
		updateItem(itemId, data);
		stopEditingItem();
	};

	const attemptCancel = () => {
		if (isDiscardDialogOpen) return;
		if (isDirty) {
			setIsDiscardDialogOpen(true);
		} else {
			stopEditingItem();
		}
	};

	const handleConfirmDiscard = () => {
		setIsDiscardDialogOpen(false);
		form.reset();
		stopEditingItem();
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

	const { isDirty, errors } = form.formState;

	const titleRegister = form.register("title");
	const contentRegister = form.register("content");

	return (
		<form
			aria-label="Edit playlist item"
			onSubmit={form.handleSubmit(handleValidSubmit)}
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

			<AlertDialog
				open={isDiscardDialogOpen}
				onOpenChange={setIsDiscardDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
						<AlertDialogDescription>
							Unsaved edits to this playlist item will be lost.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setIsDiscardDialogOpen(false)}>
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

export function PlaylistItemEditor({ itemId }: PlaylistItemEditorProps) {
	const callerElementRef = useRef<HTMLElement | null>(
		typeof document !== "undefined" &&
			document.activeElement instanceof HTMLElement
			? document.activeElement
			: null,
	);

	useEffect(() => {
		return () => {
			const rowElement =
				document.querySelector<HTMLElement>(
					`[role="row"][data-item-id="${itemId}"]`,
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
	}, [itemId]);

	return (
		<HotkeysProvider scope="playlist:item-editor" exclusive>
			<EditorFormInner itemId={itemId} />
		</HotkeysProvider>
	);
}
