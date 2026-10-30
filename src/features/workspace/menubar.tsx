import { cn } from "cn";
import {
	Menubar,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarSeparator,
	MenubarTrigger,
} from "@/components/ui/menubar";
import { AppHotkeyKbd } from "@/features/workspace/app-hotkey-kbd";
import { appHotkeys } from "@/features/workspace/hotkeys";
import { useWorkspaceStore } from "@/features/workspace/store";

export type WorkspaceMenubarProps = {
	className?: string;
	onResetLayout?: () => void;
	onOpenCheatsheet?: () => void;
};

export function WorkspaceMenubar({
	className,
	onResetLayout,
	onOpenCheatsheet,
}: WorkspaceMenubarProps = {}) {
	const mode = useWorkspaceStore((state) => state.mode);
	const isEditMode = mode === "edit";

	const handleResetLayout = () => {
		if (onResetLayout) {
			onResetLayout();
		} else {
			window.dispatchEvent(new CustomEvent("workspace:reset-layout"));
		}
	};

	const handleOpenCheatsheet = () => {
		if (onOpenCheatsheet) {
			onOpenCheatsheet();
		} else {
			window.dispatchEvent(new CustomEvent("workspace:open-cheatsheet"));
		}
	};

	return (
		<Menubar className={cn(className)}>
			<MenubarMenu>
				<MenubarTrigger>View</MenubarTrigger>
				<MenubarContent>
					<MenubarItem
						onClick={() => useWorkspaceStore.getState().toggleMode()}
						className="flex items-center justify-between gap-4"
					>
						<span className="whitespace-nowrap">
							{isEditMode
								? "Done Editing"
								: appHotkeys["workspace.toggleLayoutMode"].meta?.name}
						</span>
						<AppHotkeyKbd id="workspace.toggleLayoutMode" />
					</MenubarItem>
					<MenubarSeparator />
					<MenubarItem
						variant="destructive"
						onClick={handleResetLayout}
						className="flex items-center justify-between gap-4"
					>
						<span className="whitespace-nowrap">
							{appHotkeys["workspace.resetLayout"].meta?.name}...
						</span>
						<AppHotkeyKbd id="workspace.resetLayout" />
					</MenubarItem>
				</MenubarContent>
			</MenubarMenu>
			<MenubarMenu>
				<MenubarTrigger>Help</MenubarTrigger>
				<MenubarContent>
					<MenubarItem
						onClick={handleOpenCheatsheet}
						className="flex items-center justify-between gap-4"
					>
						<span className="whitespace-nowrap">
							{appHotkeys["help.shortcuts"].meta?.name}
						</span>
						<AppHotkeyKbd id="help.shortcuts" />
					</MenubarItem>
				</MenubarContent>
			</MenubarMenu>
		</Menubar>
	);
}
