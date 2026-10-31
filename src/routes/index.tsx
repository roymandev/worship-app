import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PlaylistItemEditor } from "@/features/playlist/item-editor";
import { PlaylistPanel } from "@/features/playlist/panel";
import { usePlaylistStore } from "@/features/playlist/store";
import { HotkeysCheatsheetDialog } from "@/features/workspace/hotkeys-cheatsheet-dialog";
import { WorkspaceLayout } from "@/features/workspace/layout";
import { WorkspaceMenubar } from "@/features/workspace/menubar";
import { useWorkspaceStore } from "@/features/workspace/store";
import { APP_VERSION } from "@/utils/version";

export const Route = createFileRoute("/")({ component: WorkspaceRoute });

function SlidesPanel() {
	return (
		<div className="flex h-full items-center justify-center">
			<span className="text-2xl font-semibold text-muted-foreground">
				Center
			</span>
		</div>
	);
}

function LiveScreenPanel() {
	return (
		<div className="flex h-full items-center justify-center">
			<span className="text-2xl font-semibold text-muted-foreground">
				Right
			</span>
		</div>
	);
}

function WorkspaceRoute() {
	const mode = useWorkspaceStore((state) => state.mode);
	const isEditMode = mode === "edit";
	const toggleMode = useWorkspaceStore((s) => s.toggleMode);
	const editingItemId = usePlaylistStore((state) => state.editingItemId);
	const playlistItems = usePlaylistStore((state) => state.items);
	const isEditingItemResolved =
		editingItemId !== null &&
		playlistItems.some((item) => item.id === editingItemId);

	return (
		<main className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
			<header className="flex h-12 shrink-0 items-center gap-4 border-b px-4">
				<div className="flex items-center gap-2">
					<h1 className="text-sm font-semibold tracking-tight">Worship App</h1>
					<span
						title={`Version ${APP_VERSION}`}
						className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
					>
						v{APP_VERSION}
					</span>
				</div>
				<WorkspaceMenubar />
				{isEditMode && (
					<div className="ml-auto">
						<Button size="sm" variant="outline" onClick={toggleMode}>
							Done
						</Button>
					</div>
				)}
			</header>
			<WorkspaceLayout
				left={<PlaylistPanel />}
				center={
					isEditingItemResolved ? (
						<PlaylistItemEditor itemId={editingItemId} />
					) : (
						<SlidesPanel />
					)
				}
				right={<LiveScreenPanel />}
			/>
			<HotkeysCheatsheetDialog />
		</main>
	);
}
