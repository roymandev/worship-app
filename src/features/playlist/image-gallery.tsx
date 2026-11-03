import {
	IconCheck,
	IconPhoto,
	IconPlus,
	IconTrash,
	IconUpload,
} from "@tabler/icons-react";
import { cn } from "cn";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverClose,
	PopoverContent,
	PopoverDescription,
	PopoverTitle,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	addRecentBackgroundImage,
	type RecentBackgroundImage,
} from "./recent-images";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export type ImageGalleryProps = {
	readonly images?: readonly RecentBackgroundImage[];
	readonly selectedUrl?: string | null;
	readonly onSelectImage: (url: string) => void;
	readonly onDeselectImage?: () => void;
	readonly onRemoveImage: (id: string) => void;
	readonly onImagesChange?: (images: RecentBackgroundImage[]) => void;
	readonly className?: string;
};

export function ImageGallery({
	images = [],
	selectedUrl,
	onSelectImage,
	onDeselectImage,
	onRemoveImage,
	onImagesChange,
	className,
}: ImageGalleryProps) {
	const [popoverOpen, setPopoverOpen] = useState(false);
	const [urlInput, setUrlInput] = useState("");
	const [urlError, setUrlError] = useState<string | null>(null);
	const [uploadError, setUploadError] = useState<string | null>(null);
	const [announcement, setAnnouncement] = useState("");
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const [deletingImage, setDeletingImage] =
		useState<RecentBackgroundImage | null>(null);
	const [deletingAnchor, setDeletingAnchor] = useState<HTMLElement | null>(
		null,
	);
	const popoverCancelRef = useRef<HTMLButtonElement | null>(null);
	const popoverConfirmRef = useRef<HTMLButtonElement | null>(null);
	const addTriggerRef = useRef<HTMLButtonElement | null>(null);
	const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
	const pendingFocusIndexRef = useRef<number | null>(null);
	const urlErrorId = useId();
	const uploadErrorId = useId();

	// Calculate initial focusedIndex based on selectedUrl
	const selectedIndex = images.findIndex((img) => img.url === selectedUrl);
	const [focusedIndex, setFocusedIndex] = useState(() =>
		selectedIndex >= 0 ? selectedIndex : 0,
	);

	// Keep focusedIndex clamped within valid bounds when images change
	useEffect(() => {
		if (images.length === 0) {
			setFocusedIndex(0);
		} else if (focusedIndex >= images.length) {
			setFocusedIndex(images.length - 1);
		}
	}, [images.length, focusedIndex]);

	// When selectedUrl changes externally to an existing image, align focusedIndex
	useEffect(() => {
		if (selectedIndex >= 0) {
			setFocusedIndex(selectedIndex);
		}
	}, [selectedIndex]);

	// Focus restoration after deletion
	useEffect(() => {
		if (pendingFocusIndexRef.current !== null) {
			const targetIdx = pendingFocusIndexRef.current;
			pendingFocusIndexRef.current = null;
			if (images.length === 0) {
				addTriggerRef.current?.focus();
			} else {
				const clampedIdx = Math.min(Math.max(0, targetIdx), images.length - 1);
				setFocusedIndex(clampedIdx);
				thumbnailRefs.current[clampedIdx]?.focus();
			}
		}
	}, [images.length]);

	const handleOpenChange = (open: boolean) => {
		setPopoverOpen(open);
		if (open) {
			setUrlInput("");
			setUrlError(null);
			setUploadError(null);
		}
	};

	const handleThumbnailClick = (url: string, index: number) => {
		setFocusedIndex(index);
		if (selectedUrl === url) {
			if (onDeselectImage) {
				onDeselectImage();
			} else {
				onSelectImage("");
			}
			setAnnouncement(`Image ${index + 1} deselected`);
		} else {
			onSelectImage(url);
			setAnnouncement(`Image ${index + 1} selected`);
		}
	};

	const handleRequestDelete = (
		image: RecentBackgroundImage,
		anchorElement: HTMLElement | null,
	) => {
		setDeletingImage(image);
		setDeletingAnchor(anchorElement);
	};

	const handleCancelDelete = () => {
		const cancelledImage = deletingImage;
		setDeletingImage(null);
		setDeletingAnchor(null);
		if (cancelledImage) {
			const idx = images.findIndex((img) => img.id === cancelledImage.id);
			if (idx >= 0) {
				setFocusedIndex(idx);
				thumbnailRefs.current[idx]?.focus();
			}
		}
	};

	const handleConfirmDelete = () => {
		if (!deletingImage) return;
		const image = deletingImage;
		const index = images.findIndex((img) => img.id === image.id);
		setDeletingImage(null);
		setDeletingAnchor(null);

		// If deleted image was currently selected, automatically deselect it
		if (selectedUrl === image.url) {
			if (onDeselectImage) {
				onDeselectImage();
			} else {
				onSelectImage("");
			}
		}

		// Calculate next focus index: if last item was removed, index - 1, else index
		const safeIndex = index >= 0 ? index : 0;
		const nextIndex =
			safeIndex >= images.length - 1 ? safeIndex - 1 : safeIndex;
		pendingFocusIndexRef.current = nextIndex;

		onRemoveImage(image.id);
		setAnnouncement(`Image ${safeIndex + 1} removed`);
	};

	const handlePopoverKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (e.key === "Escape") {
			e.stopPropagation();
			handleCancelDelete();
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
			e.preventDefault();
			e.stopPropagation();
			if (e.shiftKey) {
				if (document.activeElement === popoverConfirmRef.current) {
					popoverCancelRef.current?.focus();
				} else {
					popoverConfirmRef.current?.focus();
				}
			} else {
				if (document.activeElement === popoverCancelRef.current) {
					popoverConfirmRef.current?.focus();
				} else {
					popoverCancelRef.current?.focus();
				}
			}
			return;
		}
	};

	const handleKeyDown = (
		e: React.KeyboardEvent<HTMLButtonElement>,
		image: RecentBackgroundImage,
		index: number,
	) => {
		const total = images.length;
		if (total === 0) return;

		let nextIndex: number | null = null;

		switch (e.key) {
			case "ArrowRight": {
				e.preventDefault();
				nextIndex = Math.min(index + 1, total - 1);
				break;
			}
			case "ArrowLeft": {
				e.preventDefault();
				nextIndex = Math.max(index - 1, 0);
				break;
			}
			case "ArrowDown": {
				e.preventDefault();
				if (index + 4 < total) {
					nextIndex = index + 4;
				} else {
					nextIndex = index;
				}
				break;
			}
			case "ArrowUp": {
				e.preventDefault();
				nextIndex = Math.max(index - 4, 0);
				break;
			}
			case "Home": {
				e.preventDefault();
				nextIndex = 0;
				break;
			}
			case "End": {
				e.preventDefault();
				nextIndex = total - 1;
				break;
			}
			case " ":
			case "Enter": {
				e.preventDefault();
				handleThumbnailClick(image.url, index);
				break;
			}
			case "Delete":
			case "Backspace": {
				e.preventDefault();
				handleRequestDelete(image, thumbnailRefs.current[index]);
				break;
			}
		}

		if (nextIndex !== null && nextIndex !== index) {
			setFocusedIndex(nextIndex);
			thumbnailRefs.current[nextIndex]?.focus();
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		// Reset file input value to allow selecting the same file again if needed
		e.target.value = "";
		if (!file) return;

		setUploadError(null);

		if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
			setUploadError("Only JPEG, PNG, and WebP images are supported.");
			return;
		}

		if (file.size > MAX_IMAGE_SIZE_BYTES) {
			setUploadError("Image size must be 5MB or less.");
			return;
		}

		const reader = new FileReader();
		reader.onload = async () => {
			if (typeof reader.result === "string") {
				const dataUrl = reader.result;
				const updated = await addRecentBackgroundImage(dataUrl);
				onImagesChange?.(updated);
				onSelectImage(dataUrl);
				setAnnouncement("New background image added");
				setPopoverOpen(false);
			} else {
				setUploadError("Failed to read image file.");
			}
		};
		reader.onerror = () => {
			setUploadError("Failed to read image file.");
		};
		reader.readAsDataURL(file);
	};

	const handleAddUrl = async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = urlInput.trim();
		if (!trimmed) {
			setUrlError("Image URL is required.");
			return;
		}

		setUrlError(null);
		const updated = await addRecentBackgroundImage(trimmed);
		onImagesChange?.(updated);
		onSelectImage(trimmed);
		setAnnouncement("New background image added");
		setPopoverOpen(false);
	};

	return (
		<div className={cn("flex flex-col gap-2.5", className)}>
			<div className="flex items-center justify-between">
				<span
					id="gallery-heading"
					className="font-medium text-foreground text-xs"
				>
					Image Gallery
				</span>

				<Popover open={popoverOpen} onOpenChange={handleOpenChange}>
					<PopoverTrigger
						render={
							<Button
								ref={addTriggerRef}
								data-testid="add-image-trigger"
								type="button"
								variant="outline"
								size="sm"
								className="h-7 gap-1"
							>
								<IconPlus className="size-3" aria-hidden="true" />
								<span>Add Image</span>
							</Button>
						}
					/>

					<PopoverContent
						align="end"
						side="bottom"
						sideOffset={4}
						className="flex w-72 flex-col gap-3 p-3"
						onKeyDown={(e) => {
							if (e.key === "Escape") {
								e.stopPropagation();
							}
						}}
					>
						<div className="font-semibold text-foreground text-xs">
							Add Background Image
						</div>

						{/* Compact File Picker */}
						<div className="flex flex-col gap-1.5">
							<label
								htmlFor="gallery-file-upload"
								className="text-[0.6875rem] text-muted-foreground"
							>
								Upload from device (JPEG, PNG, WebP up to 5MB)
							</label>
							<input
								id="gallery-file-upload"
								ref={fileInputRef}
								type="file"
								accept="image/jpeg,image/png,image/webp"
								onChange={handleFileChange}
								className="sr-only"
								tabIndex={-1}
							/>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => fileInputRef.current?.click()}
								className="w-full justify-center gap-1.5"
							>
								<IconUpload className="size-3.5" aria-hidden="true" />
								<span>Choose File...</span>
							</Button>
							{uploadError && (
								<p
									id={uploadErrorId}
									role="alert"
									className="text-[0.6875rem] text-destructive"
								>
									{uploadError}
								</p>
							)}
						</div>

						<div className="relative flex items-center justify-center">
							<div className="w-full border-border border-t" />
							<span className="absolute bg-popover px-2 text-[0.625rem] text-muted-foreground uppercase">
								or
							</span>
						</div>

						{/* Direct URL Form */}
						<div className="flex flex-col gap-1.5">
							<label
								htmlFor="gallery-image-url-input"
								className="text-[0.6875rem] text-muted-foreground"
							>
								Direct Image URL
							</label>
							<div className="flex items-center gap-1.5">
								<Input
									id="gallery-image-url-input"
									value={urlInput}
									onChange={(e) => {
										setUrlInput(e.target.value);
										if (urlError) setUrlError(null);
									}}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											handleAddUrl(e);
										}
									}}
									aria-invalid={Boolean(urlError)}
									aria-describedby={urlError ? urlErrorId : undefined}
									placeholder="https://example.com/image.jpg"
									className="h-7 text-xs"
								/>
								<Button
									type="button"
									size="sm"
									className="h-7 px-2.5"
									onClick={handleAddUrl}
								>
									Add
								</Button>
							</div>
							{urlError && (
								<p
									id={urlErrorId}
									role="alert"
									className="text-[0.6875rem] text-destructive"
								>
									{urlError}
								</p>
							)}
						</div>
					</PopoverContent>
				</Popover>
			</div>

			{/* Thumbnails grid */}
			{images.length > 0 ? (
				<div
					role="radiogroup"
					aria-labelledby="gallery-heading"
					className="grid grid-cols-4 gap-2"
				>
					{images.map((image, index) => {
						const isSelected = selectedUrl === image.url;
						const isFocused = index === focusedIndex;
						return (
							<div key={image.id} className="group/item relative">
								{/* biome-ignore lint/a11y/useSemanticElements: APG roving tabindex radio item */}
								<button
									ref={(el) => {
										thumbnailRefs.current[index] = el;
									}}
									type="button"
									role="radio"
									tabIndex={isFocused ? 0 : -1}
									onClick={() => handleThumbnailClick(image.url, index)}
									onKeyDown={(e) => handleKeyDown(e, image, index)}
									aria-label={`Select gallery image ${index + 1}`}
									aria-checked={isSelected}
									className={cn(
										"focus-ring block aspect-video w-full cursor-pointer overflow-hidden rounded-md border border-border/60 bg-muted/20 object-cover transition-all hover:border-primary",
										isSelected && "border-2 border-primary",
									)}
								>
									<img
										src={image.url}
										alt=""
										aria-hidden="true"
										className="h-full w-full object-cover"
									/>
									{isSelected && (
										<span
											data-testid="selected-badge"
											className="absolute right-1 bottom-1 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs"
										>
											<IconCheck className="size-2.5 stroke-[3]" />
										</span>
									)}
								</button>
								<button
									type="button"
									tabIndex={-1}
									onClick={(e) => {
										e.stopPropagation();
										handleRequestDelete(image, thumbnailRefs.current[index]);
									}}
									aria-label={`Remove gallery image ${index + 1}`}
									className="focus-ring-destructive pointer-events-none absolute top-1 right-1 flex size-6 cursor-pointer items-center justify-center rounded-xs bg-background/80 text-muted-foreground opacity-0 shadow-xs transition-opacity hover:bg-background hover:text-destructive focus-visible:pointer-events-auto focus-visible:opacity-100 group-hover/item:pointer-events-auto group-hover/item:opacity-100"
								>
									<IconTrash className="size-2.5" aria-hidden="true" />
								</button>
							</div>
						);
					})}
				</div>
			) : (
				<EmptyState
					variant="inline"
					icon={<IconPhoto className="size-4 text-muted-foreground" />}
					title="No images in gallery"
					description="Add images to reuse across items"
					className="min-h-[4.75rem]"
				/>
			)}

			{/* Inline Delete Confirmation Popover */}
			<Popover
				open={deletingImage !== null}
				onOpenChange={(nextOpen) => {
					if (!nextOpen) {
						handleCancelDelete();
					}
				}}
				modal="trap-focus"
			>
				<PopoverContent
					role="alertdialog"
					initialFocus={popoverCancelRef}
					anchor={deletingAnchor}
					side="bottom"
					align="center"
					sideOffset={6}
					className="w-64 gap-3 p-3"
					onKeyDown={handlePopoverKeyDown}
				>
					<div className="flex flex-col gap-1">
						<PopoverTitle className="font-semibold text-foreground text-xs">
							Remove image?
						</PopoverTitle>
						<PopoverDescription className="text-muted-foreground text-xs">
							Are you sure you want to remove this image from the gallery?
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
									onClick={handleCancelDelete}
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
							onClick={handleConfirmDelete}
						>
							Delete
						</Button>
					</div>
				</PopoverContent>
			</Popover>

			{/* Visually hidden live region for screen reader announcements */}
			{/* biome-ignore lint/a11y/useSemanticElements: ARIA live status region for assistive technology announcements */}
			<div
				role="status"
				aria-live="polite"
				aria-atomic="true"
				className="sr-only"
			>
				{announcement}
			</div>
		</div>
	);
}
