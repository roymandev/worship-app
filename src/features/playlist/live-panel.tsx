import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { LiveCueListPanel } from "@/features/playlist/live-cue-list-panel";
import { LivePreviewScreenPanel } from "@/features/playlist/live-preview-screen-panel";
import { useWorkspaceStore } from "@/features/workspace/store";

export function LivePanel() {
	const isEditMode = useWorkspaceStore((state) => state.mode === "edit");

	return (
		<div data-workspace-panel="live" className="h-full w-full">
			<ResizablePanelGroup
				orientation="vertical"
				autoSaveId="workspace-live-layout"
				className="h-full w-full"
			>
				<ResizablePanel id="live-top" defaultSize={65} minSize={30}>
					<LiveCueListPanel />
				</ResizablePanel>
				<ResizableHandle disabled={!isEditMode} withHandle={isEditMode} />
				<ResizablePanel id="live-bottom" defaultSize={35} minSize={20}>
					<LivePreviewScreenPanel />
				</ResizablePanel>
			</ResizablePanelGroup>
		</div>
	);
}
