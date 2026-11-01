import { beforeEach, describe, expect, it } from "bun:test";
import { useWorkspaceStore } from "./store";

describe("useWorkspaceStore", () => {
	beforeEach(() => {
		useWorkspaceStore.setState({
			mode: "view",
			isResetDialogOpen: false,
			isCheatsheetOpen: false,
		});
	});

	it("initializes with default state", () => {
		const state = useWorkspaceStore.getState();
		expect(state.mode).toBe("view");
		expect(state.isResetDialogOpen).toBe(false);
		expect(state.isCheatsheetOpen).toBe(false);
	});

	it("transitions mode via setMode and toggleMode", () => {
		useWorkspaceStore.getState().setMode("edit");
		expect(useWorkspaceStore.getState().mode).toBe("edit");

		useWorkspaceStore.getState().setMode("view");
		expect(useWorkspaceStore.getState().mode).toBe("view");

		useWorkspaceStore.getState().toggleMode();
		expect(useWorkspaceStore.getState().mode).toBe("edit");

		useWorkspaceStore.getState().toggleMode();
		expect(useWorkspaceStore.getState().mode).toBe("view");
	});

	it("transitions reset dialog state via openResetDialog and closeResetDialog", () => {
		useWorkspaceStore.getState().openResetDialog();
		expect(useWorkspaceStore.getState().isResetDialogOpen).toBe(true);

		useWorkspaceStore.getState().closeResetDialog();
		expect(useWorkspaceStore.getState().isResetDialogOpen).toBe(false);
	});

	it("transitions cheatsheet state via openCheatsheet, closeCheatsheet, and toggleCheatsheet", () => {
		useWorkspaceStore.getState().openCheatsheet();
		expect(useWorkspaceStore.getState().isCheatsheetOpen).toBe(true);

		useWorkspaceStore.getState().closeCheatsheet();
		expect(useWorkspaceStore.getState().isCheatsheetOpen).toBe(false);

		useWorkspaceStore.getState().toggleCheatsheet();
		expect(useWorkspaceStore.getState().isCheatsheetOpen).toBe(true);

		useWorkspaceStore.getState().toggleCheatsheet();
		expect(useWorkspaceStore.getState().isCheatsheetOpen).toBe(false);
	});
});
