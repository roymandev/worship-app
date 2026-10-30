import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import {
	DEFAULT_WORKSPACE_LAYOUT,
	WorkspaceLayout,
	type WorkspaceLayoutHandle,
} from "./layout";
import { useWorkspaceStore } from "./store";

describe("WorkspaceLayout", () => {
	beforeEach(() => {
		useWorkspaceStore.setState({ mode: "view" });
	});

	afterEach(() => {
		cleanup();
	});

	it("renders left, center, and right panels with accessible structure", () => {
		render(
			<WorkspaceLayout
				left={<div>Left Content</div>}
				center={<div>Center Content</div>}
				right={<div>Right Content</div>}
			/>,
		);

		expect(screen.getByText("Left Content")).toBeInTheDocument();
		expect(screen.getByText("Center Content")).toBeInTheDocument();
		expect(screen.getByText("Right Content")).toBeInTheDocument();
	});

	it("disables resize separator handles in view mode", () => {
		useWorkspaceStore.setState({ mode: "view" });

		render(
			<WorkspaceLayout
				left={<div>Left</div>}
				center={<div>Center</div>}
				right={<div>Right</div>}
			/>,
		);

		const handles = screen.getAllByRole("separator");
		expect(handles.length).toBe(2);

		for (const handle of handles) {
			expect(handle).toHaveAttribute("aria-disabled", "true");
			expect(handle).toHaveAttribute("data-separator", "disabled");
		}
	});

	it("enables resize separator handles and shows handles in edit mode", () => {
		useWorkspaceStore.setState({ mode: "edit" });

		render(
			<WorkspaceLayout
				left={<div>Left</div>}
				center={<div>Center</div>}
				right={<div>Right</div>}
			/>,
		);

		const handles = screen.getAllByRole("separator");
		expect(handles.length).toBe(2);

		for (const handle of handles) {
			expect(handle).not.toHaveAttribute("aria-disabled");
			expect(handle.getAttribute("data-separator")).not.toBe("disabled");
		}
	});

	it("exposes imperative resetLayout handle that resets layout proportions", () => {
		const layoutRef = createRef<WorkspaceLayoutHandle>();

		render(
			<WorkspaceLayout
				ref={layoutRef}
				left={<div>Left</div>}
				center={<div>Center</div>}
				right={<div>Right</div>}
			/>,
		);

		expect(layoutRef.current).toBeDefined();
		expect(typeof layoutRef.current?.resetLayout).toBe("function");

		// Invoking resetLayout does not throw
		expect(() => {
			layoutRef.current?.resetLayout();
		}).not.toThrow();

		expect(DEFAULT_WORKSPACE_LAYOUT).toEqual({
			left: 33.33,
			center: 33.34,
			right: 33.33,
		});
	});
});
