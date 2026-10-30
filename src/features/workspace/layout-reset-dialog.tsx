import { HotkeysProvider } from "@tanstack/react-hotkeys";
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

export type WorkspaceResetDialogProps = {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	onConfirm?: () => void;
};

export function WorkspaceResetDialog({
	open,
	onOpenChange,
	onConfirm,
}: WorkspaceResetDialogProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<HotkeysProvider
					scope="workspace:reset-dialog"
					exclusive
					enabled={open}
				>
					<AlertDialogHeader>
						<AlertDialogTitle>Reset workspace layout?</AlertDialogTitle>
						<AlertDialogDescription>
							This will reset all panels to their default 33% width proportions.
							Your content will not be affected.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								onConfirm?.();
								onOpenChange?.(false);
							}}
						>
							Reset layout
						</AlertDialogAction>
					</AlertDialogFooter>
				</HotkeysProvider>
			</AlertDialogContent>
		</AlertDialog>
	);
}
