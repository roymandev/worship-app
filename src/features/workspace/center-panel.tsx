import { PlaylistItemEditor } from "@/features/playlist/item-editor";
import { usePlaylistStore } from "@/features/playlist/store";

function SlidesPanel() {
	return (
		<div className="flex h-full items-center justify-center">
			<span className="text-2xl font-semibold text-muted-foreground">
				Center
			</span>
		</div>
	);
}

export function WorkspaceCenterPanel() {
	const editingItemId = usePlaylistStore((state) => state.editingItemId);
	const playlistItems = usePlaylistStore((state) => state.items);

	const isEditingItemResolved =
		editingItemId !== null &&
		playlistItems.some((item) => item.id === editingItemId);

	if (isEditingItemResolved) {
		return <PlaylistItemEditor />;
	}

	return <SlidesPanel />;
}
