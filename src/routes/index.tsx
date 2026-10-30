import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
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
import { Button } from "@/components/ui/button";
import {
	Menubar,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarSeparator,
	MenubarTrigger,
} from "@/components/ui/menubar";
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
	const [resetDialogOpen, setResetDialogOpen] = useState(false);
	const mode = useWorkspaceStore((s) => s.mode);

	const handleReset = () => {
		groupRef.current?.setLayout({
			left: 33.33,
			center: 33.34,
			right: 33.33,
		});
	};

	const isEditMode = mode === "edit";

	return (
		<main className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
			<header className="flex h-12 shrink-0 items-center gap-4 border-b px-4">
				<h1 className="text-sm font-semibold tracking-tight">Worship App</h1>
				<Menubar>
					<MenubarMenu>
						<MenubarTrigger>View</MenubarTrigger>
						<MenubarContent>
							<MenubarItem
								disabled={isEditMode}
								onClick={() => useWorkspaceStore.getState().setMode("edit")}
							>
								Edit Layout
							</MenubarItem>
							<MenubarSeparator />
							<MenubarItem onClick={() => setResetDialogOpen(true)}>
								Reset Layout...
							</MenubarItem>
						</MenubarContent>
					</MenubarMenu>
				</Menubar>
				{isEditMode && (
					<div className="ml-auto">
						<Button
							size="sm"
							onClick={() => useWorkspaceStore.getState().setMode("view")}
						>
							Done
						</Button>
					</div>
				)}
				<AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Reset layout to defaults?</AlertDialogTitle>
							<AlertDialogDescription>
								This will restore the workspace panel widths back to equal
								default proportions (33.3% each). Any custom sizing adjustments
								will be lost.
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
