import { IconList } from "@tabler/icons-react";
import { EmptyState } from "@/components/ui/empty";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { CueListPanel } from "@/features/playlist/cue-list-panel";
import { PlaylistItemEditor } from "@/features/playlist/item-editor";
import { PreviewScreenPanel } from "@/features/playlist/preview-screen-panel";
import { usePlaylistStore } from "@/features/playlist/store";
import { useWorkspaceStore } from "@/features/workspace/store";

export function StagePanel() {
	const editingItemId = usePlaylistStore((state) => state.editingItemId);
	const selectedItemId = usePlaylistStore((state) => state.selectedItemId);
	const playlistItems = usePlaylistStore((state) => state.items);
	const isEditMode = useWorkspaceStore((state) => state.mode === "edit");

	const isEditingItemResolved =
		editingItemId !== null &&
		playlistItems.some((item) => item.id === editingItemId);

	const isSelectedItemResolved =
		selectedItemId !== null &&
		playlistItems.some((item) => item.id === selectedItemId);

	return (
		<div data-workspace-panel="stage" className="h-full w-full">
			<ResizablePanelGroup
				orientation="vertical"
				autoSaveId="workspace-center-layout"
				className="h-full w-full"
			>
				<ResizablePanel id="center-top" defaultSize={65} minSize={30}>
					{isEditingItemResolved ? (
						<PlaylistItemEditor />
					) : isSelectedItemResolved ? (
						<CueListPanel />
					) : (
						<div className="flex h-full items-center justify-center p-6">
							<EmptyState
								className="border-none"
								icon={<IconList className="size-4" />}
								title="No playlist item selected"
								description="Select an item from the playlist to view its cues."
							/>
						</div>
					)}
				</ResizablePanel>
				<ResizableHandle disabled={!isEditMode} withHandle={isEditMode} />
				<ResizablePanel id="center-bottom" defaultSize={35} minSize={20}>
					<PreviewScreenPanel />
				</ResizablePanel>
			</ResizablePanelGroup>
		</div>
	);
}
