import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WorkspaceLayout } from "./layout";
import { useWorkspaceStore } from "./store";

describe("WorkspaceLayout", () => {
	beforeEach(() => {
		useWorkspaceStore.setState({
			mode: "view",
		});
	});

	afterEach(() => {
		cleanup();
	});

	it("renders panels properly", () => {
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

	it("opens reset dialog on workspace:reset-layout event and cancels", async () => {
		const user = userEvent.setup();
		render(
			<WorkspaceLayout
				left={<div>Left</div>}
				center={<div>Center</div>}
				right={<div>Right</div>}
			/>,
		);

		expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();

		act(() => {
			window.dispatchEvent(new CustomEvent("workspace:reset-layout"));
		});

		expect(screen.getByRole("alertdialog")).toBeInTheDocument();
		expect(screen.getByText("Reset workspace layout?")).toBeInTheDocument();

		const cancelButton = screen.getByRole("button", { name: /cancel/i });
		await user.click(cancelButton);

		expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
	});

	it("executes layout reset when reset button in dialog is clicked", async () => {
		const user = userEvent.setup();
		render(
			<WorkspaceLayout
				left={<div>Left</div>}
				center={<div>Center</div>}
				right={<div>Right</div>}
			/>,
		);

		act(() => {
			window.dispatchEvent(new CustomEvent("workspace:reset-layout"));
		});

		const resetButton = screen.getByRole("button", { name: "Reset layout" });
		await user.click(resetButton);

		expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
	});
});
