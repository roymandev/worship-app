import { beforeEach, describe, expect, it } from "bun:test";
import { useWorkspaceStore } from "./store";

describe("useWorkspaceStore", () => {
	beforeEach(() => {
		useWorkspaceStore.setState({
			mode: "view",
		});
	});

	it("initializes with default state", () => {
		const state = useWorkspaceStore.getState();
		expect(state.mode).toBe("view");
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
});
