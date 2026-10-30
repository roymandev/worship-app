import { useHotkey } from "@tanstack/react-hotkeys";
import { cn } from "cn";
import { useImperativeHandle, useRef } from "react";
import {
	type GroupImperativeHandle,
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { appHotkeys } from "@/features/workspace/hotkeys";
import { useWorkspaceStore } from "@/features/workspace/store";

export type WorkspaceLayoutHandle = {
	resetLayout: () => void;
};

export type WorkspaceLayoutProps = {
	left: React.ReactNode;
	center: React.ReactNode;
	right: React.ReactNode;
	className?: string;
	ref?: React.Ref<WorkspaceLayoutHandle>;
};

export const DEFAULT_WORKSPACE_LAYOUT = {
	left: 33.33,
	center: 33.34,
	right: 33.33,
};

export function WorkspaceLayout({
	left,
	center,
	right,
	className,
	ref,
}: WorkspaceLayoutProps) {
	const groupRef = useRef<GroupImperativeHandle | null>(null);
	const mode = useWorkspaceStore((state) => state.mode);

	useHotkey(
		appHotkeys["workspace.toggleLayoutMode"],
		() => useWorkspaceStore.getState().toggleMode(),
		{ ignoreInputs: "auto" },
	);

	useImperativeHandle(
		ref,
		() => ({
			resetLayout: () => {
				groupRef.current?.setLayout(DEFAULT_WORKSPACE_LAYOUT);
			},
		}),
		[],
	);

	const isEditMode = mode === "edit";

	return (
		<div className={cn("min-h-0 w-full flex-1", className)}>
			<ResizablePanelGroup
				groupRef={groupRef}
				orientation="horizontal"
				autoSaveId="workspace-layout"
				className="h-full w-full"
			>
				<ResizablePanel id="left" defaultSize={33.33} minSize={15}>
					{left}
				</ResizablePanel>
				<ResizableHandle disabled={!isEditMode} withHandle={isEditMode} />
				<ResizablePanel id="center" defaultSize={33.34} minSize={15}>
					{center}
				</ResizablePanel>
				<ResizableHandle disabled={!isEditMode} withHandle={isEditMode} />
				<ResizablePanel id="right" defaultSize={33.33} minSize={15}>
					{right}
				</ResizablePanel>
			</ResizablePanelGroup>
		</div>
	);
}
