import { HotkeysProvider, useHotkey } from "@tanstack/react-hotkeys";
import { cn } from "cn";
import { useRef } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	type GroupImperativeHandle,
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { usePlaylistStore } from "@/features/playlist/store";
import { appHotkeys } from "@/features/workspace/hotkeys";
import { useWorkspaceStore } from "@/features/workspace/store";

export type WorkspaceLayoutProps = {
	left: React.ReactNode;
	center: React.ReactNode;
	right: React.ReactNode;
	className?: string;
};

const DEFAULT_LAYOUT = {
	left: 33.33,
	center: 33.34,
	right: 33.33,
};

export function WorkspaceLayout({
	left,
	center,
	right,
	className,
}: WorkspaceLayoutProps) {
	const groupRef = useRef<GroupImperativeHandle | null>(null);
	const mode = useWorkspaceStore((state) => state.mode);
	const isResetDialogOpen = useWorkspaceStore(
		(state) => state.isResetDialogOpen,
	);
	const openResetDialog = useWorkspaceStore((state) => state.openResetDialog);
	const closeResetDialog = useWorkspaceStore((state) => state.closeResetDialog);

	useHotkey(
		appHotkeys["workspace.toggleLayoutMode"],
		() => useWorkspaceStore.getState().toggleMode(),
		{ ignoreInputs: "auto" },
	);

	useHotkey(appHotkeys["workspace.resetLayout"], () => openResetDialog(), {
		ignoreInputs: "auto",
	});

	useHotkey(
		appHotkeys["presentation.toggleClear"],
		() => usePlaylistStore.getState().toggleLiveClear(),
		{ ignoreInputs: "auto" },
	);

	useHotkey(
		appHotkeys["presentation.toggleBlackout"],
		() => usePlaylistStore.getState().toggleLiveBlackout(),
		{ ignoreInputs: "auto" },
	);

	const isEditMode = mode === "edit";

	const handleReset = () => {
		groupRef.current?.setLayout(DEFAULT_LAYOUT);
		closeResetDialog();
	};

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

			<AlertDialog
				open={isResetDialogOpen}
				onOpenChange={(open) => !open && closeResetDialog()}
			>
				<AlertDialogContent>
					<HotkeysProvider
						scope="workspace:reset-dialog"
						exclusive
						enabled={isResetDialogOpen}
					>
						<AlertDialogHeader>
							<AlertDialogTitle>Reset workspace layout?</AlertDialogTitle>
							<AlertDialogDescription>
								This will reset all panels to their default 33% width
								proportions. Your content will not be affected.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel onClick={closeResetDialog}>
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction onClick={handleReset}>
								Reset layout
							</AlertDialogAction>
						</AlertDialogFooter>
					</HotkeysProvider>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
