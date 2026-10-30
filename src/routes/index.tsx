import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { HotkeysCheatsheetDialog } from "@/features/workspace/hotkeys-cheatsheet-dialog";
import { WorkspaceLayout } from "@/features/workspace/layout";
import { WorkspaceMenubar } from "@/features/workspace/menubar";
import { useWorkspaceStore } from "@/features/workspace/store";

export const Route = createFileRoute("/")({ component: Home });

function PlaylistPanel() {
	return (
		<div className="flex h-full items-center justify-center">
			<span className="text-2xl font-semibold text-muted-foreground">Left</span>
		</div>
	);
}

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

function Home() {
	const mode = useWorkspaceStore((state) => state.mode);
	const isEditMode = mode === "edit";
	const toggleMode = useWorkspaceStore((s) => s.toggleMode);

	return (
		<main className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
			<header className="flex h-12 shrink-0 items-center gap-4 border-b px-4">
				<h1 className="text-sm font-semibold tracking-tight">Worship App</h1>
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
				center={<SlidesPanel />}
				right={<LiveScreenPanel />}
			/>
			<HotkeysCheatsheetDialog />
		</main>
	);
}
