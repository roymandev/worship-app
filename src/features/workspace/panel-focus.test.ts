import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { focusWorkspacePanel } from "./panel-focus";

describe("focusWorkspacePanel", () => {
	beforeEach(() => {
		document.body.innerHTML = "";
	});

	afterEach(() => {
		document.body.innerHTML = "";
	});

	it("returns false if target panel container does not exist in DOM", () => {
		const result = focusWorkspacePanel("stage");
		expect(result).toBe(false);
	});

	it("focuses the active roving item ([tabindex='0']) inside the target panel", () => {
		const stagePanel = document.createElement("div");
		stagePanel.setAttribute("data-workspace-panel", "stage");

		const item1 = document.createElement("button");
		item1.setAttribute("tabindex", "-1");
		const item2 = document.createElement("button");
		item2.setAttribute("tabindex", "0");
		const item3 = document.createElement("button");
		item3.setAttribute("tabindex", "-1");

		stagePanel.appendChild(item1);
		stagePanel.appendChild(item2);
		stagePanel.appendChild(item3);
		document.body.appendChild(stagePanel);

		const result = focusWorkspacePanel("stage");
		expect(result).toBe(true);
		expect(document.activeElement).toBe(item2);
	});

	it("falls back to focusable interactive elements (button, a, role) if no [tabindex='0'] roving child exists", () => {
		const playlistPanel = document.createElement("section");
		playlistPanel.setAttribute("data-workspace-panel", "playlist");
		const addButton = document.createElement("button");
		addButton.textContent = "+ Add Item";
		playlistPanel.appendChild(addButton);
		document.body.appendChild(playlistPanel);

		const result = focusWorkspacePanel("playlist");
		expect(result).toBe(true);
		expect(playlistPanel.hasAttribute("tabindex")).toBe(false);
		expect(document.activeElement).toBe(addButton);
	});

	it("returns false and does not set tabindex='-1' on panel container when no focusable child exists", () => {
		const emptyPanel = document.createElement("div");
		emptyPanel.setAttribute("data-workspace-panel", "live");
		document.body.appendChild(emptyPanel);

		const result = focusWorkspacePanel("live");
		expect(result).toBe(false);
		expect(emptyPanel.hasAttribute("tabindex")).toBe(false);
		expect(document.activeElement).not.toBe(emptyPanel);
	});

	it("targets the correct panel among multiple workspace panels", () => {
		const playlistPanel = document.createElement("div");
		playlistPanel.setAttribute("data-workspace-panel", "playlist");
		const playlistItem = document.createElement("div");
		playlistItem.setAttribute("tabindex", "0");
		playlistPanel.appendChild(playlistItem);

		const stagePanel = document.createElement("div");
		stagePanel.setAttribute("data-workspace-panel", "stage");
		const stageItem = document.createElement("div");
		stageItem.setAttribute("tabindex", "0");
		stagePanel.appendChild(stageItem);

		const livePanel = document.createElement("div");
		livePanel.setAttribute("data-workspace-panel", "live");
		const liveItem = document.createElement("div");
		liveItem.setAttribute("tabindex", "0");
		livePanel.appendChild(liveItem);

		document.body.appendChild(playlistPanel);
		document.body.appendChild(stagePanel);
		document.body.appendChild(livePanel);

		expect(focusWorkspacePanel("playlist")).toBe(true);
		expect(document.activeElement).toBe(playlistItem);

		expect(focusWorkspacePanel("live")).toBe(true);
		expect(document.activeElement).toBe(liveItem);

		expect(focusWorkspacePanel("stage")).toBe(true);
		expect(document.activeElement).toBe(stageItem);
	});
});
