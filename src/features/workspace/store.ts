import { create } from "zustand";

export type WorkspaceLayoutMode = "view" | "edit";

type WorkspaceState = {
	mode: WorkspaceLayoutMode;
	setMode: (mode: WorkspaceLayoutMode) => void;
	toggleMode: () => void;
};

export const useWorkspaceStore = create<WorkspaceState>()((set) => ({
	mode: "view",
	setMode: (mode) => set({ mode }),
	toggleMode: () =>
		set((state) => ({
			mode: state.mode === "view" ? "edit" : "view",
		})),
}));
