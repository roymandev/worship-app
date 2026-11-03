import { zodResolver } from "@hookform/resolvers/zod";
import { IconPencil } from "@tabler/icons-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
	BrightnessInputField,
	ColorPickerField,
	DEFAULT_PRESET_COLORS,
} from "@/features/playlist/color-picker-field";
import { ImageGallery } from "@/features/playlist/image-gallery";
import {
	addRecentBackgroundImage,
	getRecentBackgroundImages,
	removeRecentBackgroundImage,
} from "@/features/playlist/recent-images";
import { usePlaylistStore } from "@/features/playlist/store";
import { appHotkeys } from "@/features/workspace/hotkeys";

export const playlistItemFormSchema = z.object({
	title: z.string().trim().min(1, "Title is required"),
	content: z.string().default(""),
	background: z
		.discriminatedUnion("type", [
			z.object({
				type: z.literal("image"),
				url: z.string().min(1, "Image URL or data is required"),
				brightness: z.number().min(0).max(100).default(100),
				color: z.string().optional(),
			}),
			z.object({
				type: z.literal("color"),
				color: z.string().min(1, "Color is required"),
				brightness: z.number().min(0).max(100).optional(),
			}),
		])
		.nullable()
		.optional(),
});

export type PlaylistItemFormInput = z.input<typeof playlistItemFormSchema>;
export type PlaylistItemFormOutput = z.output<typeof playlistItemFormSchema>;

export const playlistItemFormDefaultValues: PlaylistItemFormInput = {
	title: "",
	content: "",
	background: null,
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
	const setDraft = usePlaylistStore((state) => state.setEditorDraft);
	const clearDraft = usePlaylistStore((state) => state.clearEditorDraft);
	const recentImages = usePlaylistStore((state) => state.backgroundGallery);
	const setBackgroundGallery = usePlaylistStore(
		(state) => state.setBackgroundGallery,
	);
	const removeGalleryImage = usePlaylistStore(
		(state) => state.removeGalleryImage,
	);

	const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);
	const [draftImageUrl, setDraftImageUrl] = useState<string>(
		item?.background?.type === "image" ? item.background.url : "",
	);
	const [draftColor, setDraftColor] = useState<string>(
		item?.background?.type === "image"
			? item.background.color || "#000000"
			: item?.background?.type === "color"
				? item.background.color
				: DEFAULT_PRESET_COLORS[0].value,
	);
	const [draftBrightness, setDraftBrightness] = useState<number>(
		item?.background && "brightness" in item.background
			? (item.background.brightness ?? 100)
			: 100,
	);

	useEffect(() => {
		let isMounted = true;
		void getRecentBackgroundImages().then((images) => {
			if (isMounted) {
				setBackgroundGallery(images);
			}
		});
		return () => {
			isMounted = false;
		};
	}, [setBackgroundGallery]);
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
			? {
					title: item.title,
					content: item.content,
					background: item.background ?? null,
				}
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

	// Synchronously track current itemId to avoid resetting dirty form on self-updates from debounce/blur
	const currentItemIdRef = useRef<string | null>(null);

	useEffect(() => {
		if (item) {
			if (currentItemIdRef.current !== item.id) {
				currentItemIdRef.current = item.id;
				form.reset({
					title: item.title,
					content: item.content,
					background: item.background ?? null,
				});
				setDraftImageUrl(
					item.background?.type === "image" ? item.background.url : "",
				);
				setDraftColor(
					item.background?.type === "image"
						? item.background.color || "#000000"
						: item.background?.type === "color"
							? item.background.color
							: DEFAULT_PRESET_COLORS[0].value,
				);
				setDraftBrightness(
					item.background && "brightness" in item.background
						? (item.background.brightness ?? 100)
						: 100,
				);
				setDraft(item.content, 0);
			}
		} else {
			currentItemIdRef.current = null;
			form.reset(playlistItemFormDefaultValues);
			setDraftImageUrl("");
			setDraftColor(DEFAULT_PRESET_COLORS[0].value);
			setDraftBrightness(100);
			clearDraft();
		}
	}, [item, form.reset, setDraft, clearDraft]);

	useEffect(() => {
		return () => {
			clearDraft();
		};
	}, [clearDraft]);

	useEffect(() => {
		titleInputRef.current?.focus();
	}, []);

	useEffect(() => {
		if (!item) {
			stopEditingItem();
		}
	}, [item, stopEditingItem]);

	const syncPreviewFromTextarea = (target: HTMLTextAreaElement | null) => {
		if (!target) return;
		setDraft(target.value, target.selectionStart ?? 0);
	};

	const handleContentBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
		contentRegister.onBlur(e);
		const values = form.getValues();
		const parsed = playlistItemFormSchema.safeParse(values);
		if (parsed.success) {
			updateItem(itemId, parsed.data);
		}
	};

	const handleValidSubmit = (data: PlaylistItemFormOutput) => {
		clearDraft();
		onDirtyChange?.(false);
		form.reset(data);
		updateItem(itemId, data);
		if (data.background?.type === "image" && data.background.url) {
			const imageUrl = data.background.url;
			void addRecentBackgroundImage(imageUrl).then((updated) => {
				setBackgroundGallery(updated);
			});
		}
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
			clearDraft();
			stopEditingItem();
		}
	};

	const handleConfirmDiscard = () => {
		discardTriggeredRef.current = true;
		setIsDiscardDialogOpen(false);
		clearDraft();
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

	const applyBackground = (
		imageUrl: string,
		color: string,
		brightness: number,
	) => {
		if (imageUrl.trim()) {
			form.setValue(
				"background",
				{
					type: "image",
					url: imageUrl.trim(),
					brightness,
					color: color.trim() || undefined,
				},
				{ shouldDirty: true, shouldValidate: true },
			);
		} else if (color.trim()) {
			form.setValue(
				"background",
				{ type: "color", color: color.trim(), brightness },
				{ shouldDirty: true, shouldValidate: true },
			);
		} else {
			form.setValue("background", null, {
				shouldDirty: true,
				shouldValidate: true,
			});
		}
	};

	const handleSelectImage = (url: string) => {
		setDraftImageUrl(url);
		applyBackground(url, draftColor, draftBrightness);
	};

	const handleDeselectImage = () => {
		setDraftImageUrl("");
		applyBackground("", draftColor, draftBrightness);
	};

	const handleRemoveGalleryImage = (id: string) => {
		const targetImage = recentImages.find((img) => img.id === id);
		if (targetImage && draftImageUrl === targetImage.url) {
			handleDeselectImage();
		}
		removeGalleryImage(id);
		void removeRecentBackgroundImage(id).then((updated) => {
			setBackgroundGallery(updated);
		});
	};

	const handleColorChange = (newColor: string) => {
		setDraftColor(newColor);
		applyBackground(draftImageUrl, newColor, draftBrightness);
	};

	const handleBrightnessChange = (value: number) => {
		setDraftBrightness(value);
		applyBackground(draftImageUrl, draftColor, value);
	};

	const titleRegister = form.register("title");
	const contentRegister = form.register("content");

	return (
		<form
			aria-label="Edit playlist item"
			onSubmit={form.handleSubmit(handleValidSubmit)}
			onFocus={handleFocusIn}
			className="flex h-full w-full flex-col overflow-hidden"
		>
			<header className="flex h-10 shrink-0 items-center justify-between border-b px-3">
				<div className="flex items-center gap-2">
					<IconPencil className="size-4 text-muted-foreground" />
					<h2 className="text-xs font-semibold">Edit Playlist Item</h2>
				</div>
				<div className="flex items-center gap-2">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={attemptCancel}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						size="sm"
						disabled={form.formState.isSubmitting}
					>
						Save
					</Button>
				</div>
			</header>

			<Tabs
				defaultValue="general"
				className="flex flex-1 flex-col overflow-hidden gap-0"
			>
				<div className="border-b px-3 pt-3 pb-2">
					<TabsList variant="default" className="w-full">
						<TabsTrigger value="general">General</TabsTrigger>
						<TabsTrigger value="background">Background</TabsTrigger>
					</TabsList>
				</div>

				<TabsContent
					value="general"
					tabIndex={-1}
					className="flex flex-1 flex-col gap-4 overflow-y-auto p-4"
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
							onBlur={handleContentBlur}
							onChange={(e) => {
								contentRegister.onChange(e);
								syncPreviewFromTextarea(e.currentTarget);
							}}
							onKeyUp={(e) => {
								syncPreviewFromTextarea(e.currentTarget);
							}}
							onClick={(e) => {
								syncPreviewFromTextarea(e.currentTarget);
							}}
							onSelect={(e) => {
								syncPreviewFromTextarea(e.currentTarget);
							}}
							placeholder="Enter slide content or lyrics..."
							className="flex-1 resize-none"
						/>
					</div>
				</TabsContent>

				<TabsContent
					value="background"
					tabIndex={-1}
					className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 text-xs"
				>
					{/* Image Gallery */}
					<ImageGallery
						images={recentImages}
						selectedUrl={draftImageUrl}
						onSelectImage={handleSelectImage}
						onDeselectImage={handleDeselectImage}
						onRemoveImage={handleRemoveGalleryImage}
						onImagesChange={(images) => {
							setBackgroundGallery(images);
						}}
					/>

					{/* Subtle Divider */}
					<div className="border-t border-border/50" />

					{/* Inline Color Field */}
					<ColorPickerField
						id="playlist-item-color-picker"
						label="Color"
						inline
						presets={DEFAULT_PRESET_COLORS}
						value={draftColor || DEFAULT_PRESET_COLORS[0].value}
						onChange={handleColorChange}
					/>

					{/* Inline Brightness Field */}
					<BrightnessInputField
						id="playlist-item-brightness"
						label="Brightness"
						value={draftBrightness}
						onChange={handleBrightnessChange}
					/>
				</TabsContent>
			</Tabs>

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
