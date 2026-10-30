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

	it("updates reset dialog state", () => {
		useWorkspaceStore.getState().openResetConfirmation();
		expect(useWorkspaceStore.getState().isResetDialogOpen).toBe(true);

		useWorkspaceStore.getState().closeResetConfirmation();
		expect(useWorkspaceStore.getState().isResetDialogOpen).toBe(false);
	});

	it("updates cheatsheet state", () => {
		useWorkspaceStore.getState().openCheatsheet();
		expect(useWorkspaceStore.getState().isCheatsheetOpen).toBe(true);

		useWorkspaceStore.getState().closeCheatsheet();
		expect(useWorkspaceStore.getState().isCheatsheetOpen).toBe(false);
	});
});
