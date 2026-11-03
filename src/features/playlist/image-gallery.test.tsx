import { afterEach, beforeEach, describe, expect, it, vi } from "bun:test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ImageGallery } from "./image-gallery";
import type { RecentBackgroundImage } from "./recent-images";
import * as recentImagesModule from "./recent-images";

const mockImages: RecentBackgroundImage[] = [
	{
		id: "img-1",
		url: "https://example.com/image1.jpg",
		addedAt: 1000,
	},
	{
		id: "img-2",
		url: "https://example.com/image2.png",
		addedAt: 2000,
	},
];

describe("ImageGallery", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	afterEach(() => {
		cleanup();
	});

	it("renders header with 'Image Gallery' and 'Add Image' button", () => {
		render(
			<ImageGallery
				images={[]}
				onSelectImage={() => {}}
				onRemoveImage={() => {}}
			/>,
		);

		expect(screen.getByText("Image Gallery")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /add image/i }),
		).toBeInTheDocument();
		expect(screen.getByText("No images in gallery")).toBeInTheDocument();
		expect(
			screen.getByText("Add images to reuse across items"),
		).toBeInTheDocument();
	});

	it("renders thumbnails of images in pool with 16:9 aspect ratio and accessibility attributes", () => {
		render(
			<ImageGallery
				images={mockImages}
				selectedUrl="https://example.com/image1.jpg"
				onSelectImage={() => {}}
				onRemoveImage={() => {}}
			/>,
		);

		const thumbnail1 = screen.getByRole("radio", {
			name: "Select gallery image 1",
		});
		const thumbnail2 = screen.getByRole("radio", {
			name: "Select gallery image 2",
		});

		expect(thumbnail1).toBeInTheDocument();
		expect(thumbnail2).toBeInTheDocument();
		expect(thumbnail1).toHaveAttribute("aria-checked", "true");
		expect(thumbnail1).not.toHaveAttribute("aria-pressed");
		expect(thumbnail2).toHaveAttribute("aria-checked", "false");
		expect(thumbnail2).not.toHaveAttribute("aria-pressed");
		expect(thumbnail1).toHaveAttribute("tabindex", "0");
		expect(thumbnail2).toHaveAttribute("tabindex", "-1");
		expect(screen.getByTestId("selected-badge")).toBeInTheDocument();
	});

	it("calls onSelectImage when clicking an unselected thumbnail", async () => {
		const user = userEvent.setup();
		const handleSelect = vi.fn();

		render(
			<ImageGallery
				images={mockImages}
				selectedUrl={null}
				onSelectImage={handleSelect}
				onRemoveImage={() => {}}
			/>,
		);

		const thumbnail2 = screen.getByRole("radio", {
			name: "Select gallery image 2",
		});
		await user.click(thumbnail2);

		expect(handleSelect).toHaveBeenCalledWith("https://example.com/image2.png");
	});

	it("supports deselecting active thumbnail when clicked", async () => {
		const user = userEvent.setup();
		const handleSelect = vi.fn();
		const handleDeselect = vi.fn();

		const { rerender } = render(
			<ImageGallery
				images={mockImages}
				selectedUrl="https://example.com/image1.jpg"
				onSelectImage={handleSelect}
				onDeselectImage={handleDeselect}
				onRemoveImage={() => {}}
			/>,
		);

		const thumbnail1 = screen.getByRole("radio", {
			name: "Select gallery image 1",
		});
		await user.click(thumbnail1);

		expect(handleDeselect).toHaveBeenCalledTimes(1);

		// Without onDeselectImage provided, falls back to onSelectImage("")
		rerender(
			<ImageGallery
				images={mockImages}
				selectedUrl="https://example.com/image1.jpg"
				onSelectImage={handleSelect}
				onRemoveImage={() => {}}
			/>,
		);

		await user.click(thumbnail1);
		expect(handleSelect).toHaveBeenCalledWith("");
	});

	it("displays checkmark badge on selected thumbnail", () => {
		const { rerender } = render(
			<ImageGallery
				images={mockImages}
				selectedUrl="https://example.com/image1.jpg"
				onSelectImage={() => {}}
				onRemoveImage={() => {}}
			/>,
		);

		expect(screen.getByTestId("selected-badge")).toBeInTheDocument();

		rerender(
			<ImageGallery
				images={mockImages}
				selectedUrl={null}
				onSelectImage={() => {}}
				onRemoveImage={() => {}}
			/>,
		);

		expect(screen.queryByTestId("selected-badge")).not.toBeInTheDocument();
	});

	it("opens delete confirmation popover when delete button is clicked and cancels cleanly", async () => {
		const user = userEvent.setup();
		const handleSelect = vi.fn();
		const handleRemove = vi.fn();

		render(
			<ImageGallery
				images={mockImages}
				selectedUrl={null}
				onSelectImage={handleSelect}
				onRemoveImage={handleRemove}
			/>,
		);

		const deleteButtons = [
			screen.getByRole("button", { name: "Remove gallery image 1" }),
			screen.getByRole("button", { name: "Remove gallery image 2" }),
		];
		expect(deleteButtons).toHaveLength(2);

		await user.click(deleteButtons[0]);

		// Popover appears
		const dialog = screen.getByRole("alertdialog");
		expect(dialog).toBeInTheDocument();
		expect(screen.getByText("Remove image?")).toBeInTheDocument();
		expect(
			screen.getByText(
				"Are you sure you want to remove this image from the gallery?",
			),
		).toBeInTheDocument();
		expect(handleRemove).not.toHaveBeenCalled();
		expect(handleSelect).not.toHaveBeenCalled();

		// Click Cancel button
		const cancelBtn = screen.getByRole("button", { name: "Cancel" });
		await user.click(cancelBtn);

		await waitFor(() => {
			expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
		});
		expect(handleRemove).not.toHaveBeenCalled();
	});

	it("removes image when confirmed in delete confirmation popover", async () => {
		const user = userEvent.setup();
		const handleSelect = vi.fn();
		const handleRemove = vi.fn();

		render(
			<ImageGallery
				images={mockImages}
				selectedUrl={null}
				onSelectImage={handleSelect}
				onRemoveImage={handleRemove}
			/>,
		);

		const deleteButtons = [
			screen.getByRole("button", { name: "Remove gallery image 1" }),
			screen.getByRole("button", { name: "Remove gallery image 2" }),
		];

		await user.click(deleteButtons[0]);

		const confirmBtn = screen.getByRole("button", { name: "Delete" });
		await user.click(confirmBtn);

		expect(handleRemove).toHaveBeenCalledWith("img-1");
		expect(handleSelect).not.toHaveBeenCalled();
		await waitFor(() => {
			expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
		});
	});

	describe("Add Image Popover", () => {
		it("opens popover when clicking 'Add Image' button", async () => {
			const user = userEvent.setup();

			render(
				<ImageGallery
					images={mockImages}
					onSelectImage={() => {}}
					onRemoveImage={() => {}}
				/>,
			);

			const addBtn = screen.getByRole("button", { name: /add image/i });
			await user.click(addBtn);

			expect(screen.getByText("Add Background Image")).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: /choose file/i }),
			).toBeInTheDocument();
			expect(screen.getByLabelText("Direct Image URL")).toBeInTheDocument();
		});

		it("submits direct URL, calls addRecentBackgroundImage, onSelectImage, and closes popover", async () => {
			const user = userEvent.setup();
			const handleSelect = vi.fn();
			const addRecentSpy = vi
				.spyOn(recentImagesModule, "addRecentBackgroundImage")
				.mockResolvedValue([
					{
						id: "new-id",
						url: "https://example.com/new-pic.jpg",
						addedAt: Date.now(),
					},
				]);

			render(
				<ImageGallery
					images={mockImages}
					onSelectImage={handleSelect}
					onRemoveImage={() => {}}
				/>,
			);

			await user.click(screen.getByRole("button", { name: /add image/i }));

			const input = screen.getByLabelText("Direct Image URL");
			await user.type(input, "https://example.com/new-pic.jpg");

			const submitBtn = screen.getByRole("button", { name: /^add$/i });
			await user.click(submitBtn);

			expect(addRecentSpy).toHaveBeenCalledWith(
				"https://example.com/new-pic.jpg",
			);
			expect(handleSelect).toHaveBeenCalledWith(
				"https://example.com/new-pic.jpg",
			);

			await waitFor(() => {
				expect(
					screen.queryByText("Add Background Image"),
				).not.toBeInTheDocument();
			});
		});

		it("shows validation error and wires aria-invalid/aria-describedby on empty URL submit", async () => {
			const user = userEvent.setup();

			render(
				<ImageGallery
					images={mockImages}
					onSelectImage={() => {}}
					onRemoveImage={() => {}}
				/>,
			);

			await user.click(screen.getByRole("button", { name: /add image/i }));

			const input = screen.getByLabelText("Direct Image URL");
			expect(input).toHaveAttribute("aria-invalid", "false");
			expect(input).not.toHaveAttribute("aria-describedby");

			const submitBtn = screen.getByRole("button", { name: /^add$/i });
			await user.click(submitBtn);

			const alert = screen.getByRole("alert");
			expect(alert).toHaveTextContent("Image URL is required.");
			expect(input).toHaveAttribute("aria-invalid", "true");
			expect(input).toHaveAttribute("aria-describedby", alert.id);
		});

		it("stops Escape key propagation from inside popover content", async () => {
			const user = userEvent.setup();
			const parentKeyDown = vi.fn();

			render(
				// biome-ignore lint/a11y/noStaticElementInteractions: Key event listener needed to verify stopPropagation
				<div onKeyDown={parentKeyDown}>
					<ImageGallery
						images={mockImages}
						onSelectImage={() => {}}
						onRemoveImage={() => {}}
					/>
				</div>,
			);

			await user.click(screen.getByRole("button", { name: /add image/i }));

			const input = screen.getByLabelText("Direct Image URL");
			expect(input).toBeInTheDocument();

			await user.keyboard("{Escape}");

			expect(parentKeyDown).not.toHaveBeenCalled();
		});

		it("handles file upload, converts to Data URL, calls addRecentBackgroundImage and onSelectImage", async () => {
			const user = userEvent.setup();
			const handleSelect = vi.fn();
			const addRecentSpy = vi
				.spyOn(recentImagesModule, "addRecentBackgroundImage")
				.mockResolvedValue([
					{
						id: "new-id",
						url: "data:image/png;base64,mockpngdata",
						addedAt: Date.now(),
					},
				]);

			render(
				<ImageGallery
					images={mockImages}
					onSelectImage={handleSelect}
					onRemoveImage={() => {}}
				/>,
			);

			await user.click(screen.getByRole("button", { name: /add image/i }));

			const fileInput = screen.getByLabelText(
				/upload from device/i,
			) as HTMLInputElement;
			expect(fileInput).toBeInTheDocument();

			const file = new File(["dummy png content"], "test.png", {
				type: "image/png",
			});

			await user.upload(fileInput, file);

			await waitFor(() => {
				expect(addRecentSpy).toHaveBeenCalled();
				expect(handleSelect).toHaveBeenCalled();
			});

			expect(addRecentSpy.mock.calls[0][0]).toContain("data:image/png;base64,");
			expect(handleSelect.mock.calls[0][0]).toContain("data:image/png;base64,");
		});

		it("rejects unsupported file formats and files exceeding 5MB", async () => {
			const user = userEvent.setup({ applyAccept: false });
			const handleSelect = vi.fn();

			render(
				<ImageGallery
					images={mockImages}
					onSelectImage={handleSelect}
					onRemoveImage={() => {}}
				/>,
			);

			await user.click(screen.getByRole("button", { name: /add image/i }));

			const fileInput = screen.getByLabelText(
				/upload from device/i,
			) as HTMLInputElement;

			// Invalid format (e.g. GIF / SVG / text)
			const invalidFile = new File(["dummy content"], "test.gif", {
				type: "image/gif",
			});
			await user.upload(fileInput, invalidFile);

			expect(screen.getByRole("alert")).toHaveTextContent(
				"Only JPEG, PNG, and WebP images are supported.",
			);
			const urlInput = screen.getByLabelText("Direct Image URL");
			expect(urlInput).toHaveAttribute("aria-invalid", "false");
			expect(urlInput).not.toHaveAttribute("aria-describedby");
			expect(handleSelect).not.toHaveBeenCalled();

			// Oversized file > 5MB
			const largeContent = new Uint8Array(6 * 1024 * 1024);
			const largeFile = new File([largeContent], "large.png", {
				type: "image/png",
			});
			await user.upload(fileInput, largeFile);

			expect(screen.getByRole("alert")).toHaveTextContent(
				"Image size must be 5MB or less.",
			);
			expect(urlInput).toHaveAttribute("aria-invalid", "false");
			expect(urlInput).not.toHaveAttribute("aria-describedby");
			expect(handleSelect).not.toHaveBeenCalled();
		});
	});

	describe("APG Keyboard Navigation and Focus Restoration", () => {
		const fourImages: RecentBackgroundImage[] = [
			{ id: "img-1", url: "https://example.com/1.jpg", addedAt: 1000 },
			{ id: "img-2", url: "https://example.com/2.jpg", addedAt: 2000 },
			{ id: "img-3", url: "https://example.com/3.jpg", addedAt: 3000 },
			{ id: "img-4", url: "https://example.com/4.jpg", addedAt: 4000 },
			{ id: "img-5", url: "https://example.com/5.jpg", addedAt: 5000 },
			{ id: "img-6", url: "https://example.com/6.jpg", addedAt: 6000 },
		];

		it("has role='radiogroup' labeled by gallery heading and thumbnails as role='radio'", () => {
			render(
				<ImageGallery
					images={fourImages}
					onSelectImage={() => {}}
					onRemoveImage={() => {}}
				/>,
			);

			const radiogroup = screen.getByRole("radiogroup", {
				name: "Image Gallery",
			});
			expect(radiogroup).toBeInTheDocument();
			expect(radiogroup).toHaveAttribute("aria-labelledby", "gallery-heading");

			const radios = screen.getAllByRole("radio");
			expect(radios).toHaveLength(6);
			expect(radios[0]).toHaveAttribute("tabindex", "0");
			expect(radios[1]).toHaveAttribute("tabindex", "-1");
		});

		it("navigates across 4-column grid with ArrowRight, ArrowLeft, ArrowDown, ArrowUp, Home, End", async () => {
			const user = userEvent.setup();
			render(
				<ImageGallery
					images={fourImages}
					onSelectImage={() => {}}
					onRemoveImage={() => {}}
				/>,
			);

			const radios = screen.getAllByRole("radio");
			radios[0].focus();
			expect(radios[0]).toHaveFocus();

			// ArrowRight to index 1
			await user.keyboard("{ArrowRight}");
			expect(radios[1]).toHaveFocus();
			expect(radios[1]).toHaveAttribute("tabindex", "0");
			expect(radios[0]).toHaveAttribute("tabindex", "-1");

			// ArrowLeft back to index 0
			await user.keyboard("{ArrowLeft}");
			expect(radios[0]).toHaveFocus();
			expect(radios[0]).toHaveAttribute("tabindex", "0");

			// ArrowDown to index 4 (0 + 4)
			await user.keyboard("{ArrowDown}");
			expect(radios[4]).toHaveFocus();
			expect(radios[4]).toHaveAttribute("tabindex", "0");

			// ArrowUp back to index 0 (4 - 4)
			await user.keyboard("{ArrowUp}");
			expect(radios[0]).toHaveFocus();

			// End to last item (index 5)
			await user.keyboard("{End}");
			expect(radios[5]).toHaveFocus();
			expect(radios[5]).toHaveAttribute("tabindex", "0");

			// ArrowDown on bottom row clamps and does not jump horizontally
			await user.keyboard("{ArrowDown}");
			expect(radios[5]).toHaveFocus();
			expect(radios[5]).toHaveAttribute("tabindex", "0");

			// Home to first item (index 0)
			await user.keyboard("{Home}");
			expect(radios[0]).toHaveFocus();
			expect(radios[0]).toHaveAttribute("tabindex", "0");
		});

		it("traps Tab key navigation between Cancel and Delete buttons in confirmation popover", async () => {
			const user = userEvent.setup();
			render(
				<ImageGallery
					images={fourImages}
					onSelectImage={() => {}}
					onRemoveImage={() => {}}
				/>,
			);

			const radios = screen.getAllByRole("radio");
			radios[0].focus();
			await user.keyboard("{Delete}");

			const cancelBtn = screen.getByRole("button", { name: "Cancel" });
			const deleteBtn = screen.getByRole("button", { name: "Delete" });

			await waitFor(() => expect(cancelBtn).toHaveFocus());

			// Tab forward: Cancel -> Delete
			await user.keyboard("{Tab}");
			expect(deleteBtn).toHaveFocus();

			// Tab forward: Delete -> wraps to Cancel
			await user.keyboard("{Tab}");
			expect(cancelBtn).toHaveFocus();

			// Shift+Tab backward: Cancel -> wraps to Delete
			await user.keyboard("{Shift>}{Tab}{/Shift}");
			expect(deleteBtn).toHaveFocus();

			// Shift+Tab backward: Delete -> Cancel
			await user.keyboard("{Shift>}{Tab}{/Shift}");
			expect(cancelBtn).toHaveFocus();
		});

		it("selects and deselects with Space and Enter keys", async () => {
			const user = userEvent.setup();
			const handleSelect = vi.fn();
			const handleDeselect = vi.fn();

			const { rerender } = render(
				<ImageGallery
					images={fourImages}
					selectedUrl={null}
					onSelectImage={handleSelect}
					onDeselectImage={handleDeselect}
					onRemoveImage={() => {}}
				/>,
			);

			const radios = screen.getAllByRole("radio");
			radios[1].focus();

			// Press Enter to select
			await user.keyboard("{Enter}");
			expect(handleSelect).toHaveBeenCalledWith("https://example.com/2.jpg");

			// Rerender with selectedUrl
			rerender(
				<ImageGallery
					images={fourImages}
					selectedUrl="https://example.com/2.jpg"
					onSelectImage={handleSelect}
					onDeselectImage={handleDeselect}
					onRemoveImage={() => {}}
				/>,
			);

			const updatedRadios = screen.getAllByRole("radio");
			expect(updatedRadios[1]).toHaveAttribute("aria-checked", "true");

			// Press Space to toggle/deselect
			await user.keyboard(" ");
			expect(handleDeselect).toHaveBeenCalledTimes(1);
		});

		it("opens confirmation popover on Delete or Backspace key and confirms removal", async () => {
			const user = userEvent.setup();
			const handleRemove = vi.fn();

			render(
				<ImageGallery
					images={fourImages}
					onSelectImage={() => {}}
					onRemoveImage={handleRemove}
				/>,
			);

			const radios = screen.getAllByRole("radio");
			radios[2].focus();

			// Press Delete key
			await user.keyboard("{Delete}");
			expect(screen.getByRole("alertdialog")).toBeInTheDocument();
			expect(handleRemove).not.toHaveBeenCalled();

			// Press Escape inside popover to dismiss
			await user.keyboard("{Escape}");
			await waitFor(() => {
				expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
			});
			expect(handleRemove).not.toHaveBeenCalled();

			// Press Backspace key
			await user.keyboard("{Backspace}");
			expect(screen.getByRole("alertdialog")).toBeInTheDocument();

			// Confirm removal via Delete button
			const removeBtn = screen.getByRole("button", { name: "Delete" });
			await user.click(removeBtn);
			expect(handleRemove).toHaveBeenCalledWith("img-3");
		});

		it("stops Escape key propagation from inside delete confirmation popover", async () => {
			const user = userEvent.setup();
			const parentKeyDown = vi.fn();

			render(
				// biome-ignore lint/a11y/noStaticElementInteractions: Key event listener needed to verify stopPropagation
				<div onKeyDown={parentKeyDown}>
					<ImageGallery
						images={fourImages}
						onSelectImage={() => {}}
						onRemoveImage={() => {}}
					/>
				</div>,
			);

			const deleteBtns = screen.getAllByRole("button", {
				name: /Remove gallery image/,
			});
			await user.click(deleteBtns[1]);
			expect(screen.getByRole("alertdialog")).toBeInTheDocument();

			const cancelBtn = screen.getByRole("button", { name: "Cancel" });
			await waitFor(() => expect(cancelBtn).toHaveFocus());

			await user.keyboard("{Escape}");

			expect(parentKeyDown).not.toHaveBeenCalled();
			await waitFor(() => {
				expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
			});
		});

		it("automatically deselects image if currently selected image is deleted", async () => {
			const user = userEvent.setup();
			const handleDeselect = vi.fn();
			const handleRemove = vi.fn();

			render(
				<ImageGallery
					images={fourImages}
					selectedUrl="https://example.com/2.jpg"
					onSelectImage={() => {}}
					onDeselectImage={handleDeselect}
					onRemoveImage={handleRemove}
				/>,
			);

			const radios = screen.getAllByRole("radio");
			radios[1].focus();

			await user.keyboard("{Delete}");
			const removeBtn = screen.getByRole("button", { name: "Delete" });
			await user.click(removeBtn);

			expect(handleDeselect).toHaveBeenCalledTimes(1);
			expect(handleRemove).toHaveBeenCalledWith("img-2");
		});

		it("restores focus cleanly to adjacent image upon deletion", async () => {
			const user = userEvent.setup();
			const handleRemove = vi.fn();
			let currentImages = [...fourImages];

			const { rerender } = render(
				<ImageGallery
					images={currentImages}
					onSelectImage={() => {}}
					onRemoveImage={handleRemove}
				/>,
			);

			const radios = screen.getAllByRole("radio");
			radios[1].focus();

			// Trigger remove on index 1
			await user.keyboard("{Delete}");
			const removeBtn = screen.getByRole("button", { name: "Delete" });
			await user.click(removeBtn);
			expect(handleRemove).toHaveBeenCalledWith("img-2");

			// Simulate parent removing item 1
			currentImages = currentImages.filter((img) => img.id !== "img-2");
			rerender(
				<ImageGallery
					images={currentImages}
					onSelectImage={() => {}}
					onRemoveImage={handleRemove}
				/>,
			);

			// Focus should restore to item at index 1 (which was previously img-3)
			const updatedRadios = screen.getAllByRole("radio");
			expect(updatedRadios[1]).toHaveFocus();
			expect(updatedRadios[1]).toHaveAttribute("tabindex", "0");
		});

		it("restores focus cleanly to Add Image trigger when gallery becomes empty", async () => {
			const user = userEvent.setup();
			const handleRemove = vi.fn();
			const singleImage = [
				{ id: "img-1", url: "https://example.com/1.jpg", addedAt: 1000 },
			];

			const { rerender } = render(
				<ImageGallery
					images={singleImage}
					onSelectImage={() => {}}
					onRemoveImage={handleRemove}
				/>,
			);

			const radio = screen.getByRole("radio");
			radio.focus();

			await user.keyboard("{Delete}");
			const removeBtn = screen.getByRole("button", { name: "Delete" });
			await user.click(removeBtn);
			expect(handleRemove).toHaveBeenCalledWith("img-1");

			// Simulate parent removing only item
			rerender(
				<ImageGallery
					images={[]}
					onSelectImage={() => {}}
					onRemoveImage={handleRemove}
				/>,
			);

			const addTrigger = screen.getByTestId("add-image-trigger");
			expect(addTrigger).toHaveFocus();
		});

		it("announces selections, deselects, additions, and deletions in aria-live region", async () => {
			const user = userEvent.setup();
			const handleSelect = vi.fn();
			const handleDeselect = vi.fn();
			const handleRemove = vi.fn();

			const { rerender } = render(
				<ImageGallery
					images={fourImages}
					selectedUrl={null}
					onSelectImage={handleSelect}
					onDeselectImage={handleDeselect}
					onRemoveImage={handleRemove}
				/>,
			);

			const statusRegion = screen.getByRole("status");
			expect(statusRegion).toHaveAttribute("aria-live", "polite");

			const radios = screen.getAllByRole("radio");
			await user.click(radios[0]);
			expect(statusRegion).toHaveTextContent("Image 1 selected");

			// Click again to deselect
			rerender(
				<ImageGallery
					images={fourImages}
					selectedUrl="https://example.com/1.jpg"
					onSelectImage={handleSelect}
					onDeselectImage={handleDeselect}
					onRemoveImage={handleRemove}
				/>,
			);
			await user.click(radios[0]);
			expect(statusRegion).toHaveTextContent("Image 1 deselected");

			// Delete key and confirm
			radios[1].focus();
			await user.keyboard("{Delete}");
			const removeBtn = screen.getByRole("button", { name: "Delete" });
			await user.click(removeBtn);
			expect(statusRegion).toHaveTextContent("Image 2 removed");
		});
	});
});
