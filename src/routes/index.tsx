import { createFileRoute } from "@tanstack/react-router";
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
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	type GroupImperativeHandle,
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useWorkspaceStore } from "@/features/workspace/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
	const groupRef = useRef<GroupImperativeHandle | null>(null);
	const mode = useWorkspaceStore((s) => s.mode);

	const handleReset = () => {
		groupRef.current?.setLayout({
			left: 33.33,
			center: 33.34,
			right: 33.33,
		});
	};

	const isEditMode = mode === "edit";

	const handleToggleMode = () => {
		useWorkspaceStore.getState().toggleMode();
	};

	return (
		<main className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
			<header className="flex h-12 shrink-0 items-center justify-between border-b px-4">
				<h1 className="text-sm font-semibold tracking-tight">Worship App</h1>
				<div className="flex items-center gap-2">
					<Button
						variant={isEditMode ? "default" : "outline"}
						size="sm"
						onClick={handleToggleMode}
					>
						{isEditMode ? "Done" : "Edit Layout"}
					</Button>
					<AlertDialog>
						<AlertDialogTrigger
							disabled={!isEditMode}
							render={
								<Button variant="outline" size="sm">
									Reset Layout
								</Button>
							}
						/>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Reset layout to defaults?</AlertDialogTitle>
								<AlertDialogDescription>
									This will restore the workspace panel widths back to equal
									default proportions (33.3% each). Any custom sizing
									adjustments will be lost.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction onClick={handleReset}>
									Reset Layout
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</header>
			<div className="flex-1 min-h-0 w-full">
				<ResizablePanelGroup
					groupRef={groupRef}
					orientation="horizontal"
					autoSaveId="workspace-layout"
					className="h-full w-full"
				>
					<ResizablePanel id="left" defaultSize={33.33} minSize={15}>
						<div className="flex h-full items-center justify-center">
							<span className="text-2xl font-semibold text-muted-foreground">
								Left
							</span>
						</div>
					</ResizablePanel>
					<ResizableHandle disabled={!isEditMode} withHandle />
					<ResizablePanel id="center" defaultSize={33.34} minSize={15}>
						<div className="flex h-full items-center justify-center">
							<span className="text-2xl font-semibold text-muted-foreground">
								Center
							</span>
						</div>
					</ResizablePanel>
					<ResizableHandle disabled={!isEditMode} withHandle />
					<ResizablePanel id="right" defaultSize={33.33} minSize={15}>
						<div className="flex h-full items-center justify-center">
							<span className="text-2xl font-semibold text-muted-foreground">
								Right
							</span>
						</div>
					</ResizablePanel>
				</ResizablePanelGroup>
			</div>
		</main>
	);
}
