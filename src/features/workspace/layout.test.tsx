import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { HotkeysProvider } from "@tanstack/react-hotkeys";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
	INITIAL_PLAYLIST_STATE,
	usePlaylistStore,
} from "@/features/playlist/store";
import { appHotkeys } from "@/features/workspace/hotkeys";
import { WorkspaceLayout } from "./layout";
import { useWorkspaceStore } from "./store";

function renderWithHotkeys(ui: React.ReactElement) {
	return render(
		<HotkeysProvider
			appHotkeys={appHotkeys}
			defaultOptions={{
				hotkey: { ignoreInputs: "auto", platform: "mac" },
			}}
		>
			{ui}
		</HotkeysProvider>,
	);
}

describe("WorkspaceLayout", () => {
	beforeEach(() => {
		usePlaylistStore.setState(INITIAL_PLAYLIST_STATE);
		useWorkspaceStore.setState({
			mode: "view",
			isResetDialogOpen: false,
			isCheatsheetOpen: false,
		});
	});

	afterEach(() => {
		cleanup();
		usePlaylistStore.setState(INITIAL_PLAYLIST_STATE);
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

	it("opens reset dialog via store action and cancels", async () => {
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
			useWorkspaceStore.getState().openResetDialog();
		});

		expect(screen.getByRole("alertdialog")).toBeInTheDocument();
		expect(screen.getByText("Reset workspace layout?")).toBeInTheDocument();

		const cancelButton = screen.getByRole("button", { name: /cancel/i });
		await user.click(cancelButton);

		expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
		expect(useWorkspaceStore.getState().isResetDialogOpen).toBe(false);
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
			useWorkspaceStore.getState().openResetDialog();
		});

		const resetButton = screen.getByRole("button", { name: "Reset layout" });
		await user.click(resetButton);

		expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
		expect(useWorkspaceStore.getState().isResetDialogOpen).toBe(false);
	});

	it("toggles isLiveClear in usePlaylistStore when pressing Mod+Shift+C", async () => {
		const user = userEvent.setup();
		renderWithHotkeys(
			<WorkspaceLayout
				left={<div>Left</div>}
				center={<div>Center</div>}
				right={<div>Right</div>}
			/>,
		);

		expect(usePlaylistStore.getState().isLiveClear).toBe(false);

		await user.keyboard("{Meta>}{Shift>}c{/Shift}{/Meta}");
		expect(usePlaylistStore.getState().isLiveClear).toBe(true);

		await user.keyboard("{Meta>}{Shift>}c{/Shift}{/Meta}");
		expect(usePlaylistStore.getState().isLiveClear).toBe(false);
	});

	it("toggles isLiveBlackout in usePlaylistStore when pressing Mod+B", async () => {
		const user = userEvent.setup();
		renderWithHotkeys(
			<WorkspaceLayout
				left={<div>Left</div>}
				center={<div>Center</div>}
				right={<div>Right</div>}
			/>,
		);

		expect(usePlaylistStore.getState().isLiveBlackout).toBe(false);

		await user.keyboard("{Meta>}b{/Meta}");
		expect(usePlaylistStore.getState().isLiveBlackout).toBe(true);

		await user.keyboard("{Meta>}b{/Meta}");
		expect(usePlaylistStore.getState().isLiveBlackout).toBe(false);
	});
});
