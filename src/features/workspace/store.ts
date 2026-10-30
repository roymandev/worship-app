import { create } from "zustand";

export type WorkspaceLayoutMode = "view" | "edit";

type WorkspaceState = {
	mode: WorkspaceLayoutMode;
	isResetDialogOpen: boolean;
	isCheatsheetOpen: boolean;
	setMode: (mode: WorkspaceLayoutMode) => void;
	toggleMode: () => void;
	openResetConfirmation: () => void;
	closeResetConfirmation: () => void;
	openCheatsheet: () => void;
	closeCheatsheet: () => void;
};

export const useWorkspaceStore = create<WorkspaceState>()((set) => ({
	mode: "view",
	isResetDialogOpen: false,
	isCheatsheetOpen: false,
	setMode: (mode) => set({ mode }),
	toggleMode: () =>
		set((state) => ({
			mode: state.mode === "view" ? "edit" : "view",
		})),
	openResetConfirmation: () => set({ isResetDialogOpen: true }),
	closeResetConfirmation: () => set({ isResetDialogOpen: false }),
	openCheatsheet: () => set({ isCheatsheetOpen: true }),
	closeCheatsheet: () => set({ isCheatsheetOpen: false }),
}));
