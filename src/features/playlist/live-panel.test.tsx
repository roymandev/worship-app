import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { useWorkspaceStore } from "@/features/workspace/store";
import { LivePanel } from "./live-panel";
import { usePlaylistStore } from "./store";

describe("LivePanel", () => {
	beforeEach(() => {
		usePlaylistStore.setState(usePlaylistStore.getInitialState(), true);
		useWorkspaceStore.setState(useWorkspaceStore.getInitialState(), true);
	});

	afterEach(() => {
		cleanup();
	});

	it("renders both LiveCueListPanel and LivePreviewScreenPanel in resizable layout", () => {
		render(<LivePanel />);

		expect(
			screen.getByRole("region", { name: "Live cue list panel" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("region", { name: "Live preview screen panel" }),
		).toBeInTheDocument();
	});
});
