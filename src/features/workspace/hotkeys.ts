import { defineAppHotkeys } from "@tanstack/react-hotkeys";

export interface AppHotkeyMeta {
	name: string;
	group: "Workspace" | "Presentation" | "Help";
	description: string;
}

export const appHotkeys = defineAppHotkeys({
	"workspace.toggleLayoutMode": {
		hotkey: "Mod+E",
		meta: {
			name: "Toggle layout mode",
			group: "Workspace",
			description: "Switch between view and edit layout modes",
		},
	},
	"workspace.resetLayout": {
		hotkey: "Mod+Alt+R",
		meta: {
			name: "Reset layout to defaults",
			group: "Workspace",
			description: "Restore workspace panels to equal distribution",
		},
	},
	"presentation.goLive": {
		hotkey: "Mod+Enter",
		meta: {
			name: "Go live",
			group: "Presentation",
			description: "Stage item to live broadcast screen",
		},
	},
	"presentation.toggleBlackout": {
		hotkey: "Mod+B",
		meta: {
			name: "Toggle blackout",
			group: "Presentation",
			description: "Immediately black out projection output",
		},
	},
	"presentation.toggleClear": {
		hotkey: "Mod+Shift+C",
		meta: {
			name: "Clear slide text",
			group: "Presentation",
			description: "Clear active foreground lyrics/slides",
		},
	},
	"help.shortcuts": {
		hotkey: "Mod+/",
		meta: {
			name: "Keyboard shortcuts",
			group: "Help",
			description: "Open keyboard shortcuts reference cheatsheet",
		},
	},
});

declare module "@tanstack/react-hotkeys" {
	interface Register {
		appHotkeys: typeof appHotkeys;
	}
}

export type AppHotkeyId = keyof typeof appHotkeys;
