import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "./resizable";

describe("ResizableHandle component", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders separator with accessible role", () => {
		render(
			<ResizablePanelGroup orientation="horizontal">
				<ResizablePanel>Panel 1</ResizablePanel>
				<ResizableHandle />
				<ResizablePanel>Panel 2</ResizablePanel>
			</ResizablePanelGroup>,
		);

		const handle = screen.getByRole("separator");
		expect(handle).toBeInTheDocument();
	});

	it("supports keyboard navigation via tab key and arrow keys", async () => {
		const user = userEvent.setup();
		render(
			<ResizablePanelGroup orientation="horizontal">
				<ResizablePanel>Panel 1</ResizablePanel>
				<ResizableHandle />
				<ResizablePanel>Panel 2</ResizablePanel>
			</ResizablePanelGroup>,
		);

		const handle = screen.getByRole("separator");
		expect(handle).not.toHaveFocus();

		await user.tab();
		expect(handle).toHaveFocus();

		// Test keyboard arrow navigation
		await user.keyboard("{ArrowRight}");
		expect(handle).toHaveFocus();
		await user.keyboard("{ArrowLeft}");
		expect(handle).toHaveFocus();
	});

	it("renders visual handle bar when withHandle is provided", () => {
		render(
			<ResizablePanelGroup orientation="horizontal">
				<ResizablePanel>Panel 1</ResizablePanel>
				<ResizableHandle withHandle />
				<ResizablePanel>Panel 2</ResizablePanel>
			</ResizablePanelGroup>,
		);

		const handle = screen.getByRole("separator");
		expect(handle).toBeInTheDocument();
		expect(handle.firstElementChild).toBeInTheDocument();
	});
});
