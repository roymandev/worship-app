import { IconList } from "@tabler/icons-react";
import { EmptyState } from "@/components/ui/empty";
import { CueListPanel } from "@/features/playlist/cue-list-panel";
import { PlaylistItemEditor } from "@/features/playlist/item-editor";
import { usePlaylistStore } from "@/features/playlist/store";

export function WorkspaceCenterPanel() {
	const editingItemId = usePlaylistStore((state) => state.editingItemId);
	const selectedItemId = usePlaylistStore((state) => state.selectedItemId);
	const playlistItems = usePlaylistStore((state) => state.items);

	const isEditingItemResolved =
		editingItemId !== null &&
		playlistItems.some((item) => item.id === editingItemId);

	if (isEditingItemResolved) {
		return <PlaylistItemEditor />;
	}

	const isSelectedItemResolved =
		selectedItemId !== null &&
		playlistItems.some((item) => item.id === selectedItemId);

	if (isSelectedItemResolved) {
		return <CueListPanel />;
	}

	return (
		<div className="flex h-full items-center justify-center p-6">
			<EmptyState
				className="border-none"
				icon={<IconList className="size-4" />}
				title="No playlist item selected"
				description="Select an item from the playlist to view its cues."
			/>
		</div>
	);
}
