import { IconSearch } from "@tabler/icons-react";
import { HotkeysProvider, useHotkey } from "@tanstack/react-hotkeys";
import { useEffect, useId, useMemo, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import {
	appHotkeys,
	type HotkeySearchResult,
	searchHotkeys,
} from "@/features/workspace/hotkeys";

type CheatsheetBodyProps = {
	onClose: () => void;
};

function CheatsheetBody({ onClose }: CheatsheetBodyProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const searchInputId = useId();

	useHotkey("Escape", onClose);
	useHotkey(appHotkeys["help.shortcuts"], onClose);

	const searchResults = useMemo(() => {
		return searchHotkeys(searchQuery);
	}, [searchQuery]);

	const groupedItems = useMemo(() => {
		const grouped: Record<string, HotkeySearchResult[]> = {};
		for (const item of searchResults) {
			if (!grouped[item.group]) {
				grouped[item.group] = [];
			}
			grouped[item.group].push(item);
		}
		return grouped;
	}, [searchResults]);

	const groupNames = Object.keys(groupedItems);
	const totalResults = searchResults.length;

	return (
		<div className="flex max-h-[calc(85vh-5rem)] flex-col gap-4">
			<div className="relative">
				<IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground select-none" />
				<input
					id={searchInputId}
					type="search"
					// biome-ignore lint/a11y/noAutofocus: Cheatsheet search input intentionally auto-focus on open
					autoFocus
					data-autofocus
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					placeholder="Search shortcuts..."
					className="focus-ring h-9 w-full rounded-md border border-input bg-background pr-3 pl-9 text-xs text-foreground placeholder:text-muted-foreground"
				/>
			</div>

			<span className="sr-only" aria-live="polite">
				{totalResults === 0
					? `No shortcuts matching "${searchQuery}"`
					: `Showing ${totalResults} keyboard ${totalResults === 1 ? "shortcut" : "shortcuts"}`}
			</span>

			<div className="min-h-0 flex-1 overflow-y-auto pr-1">
				{groupNames.length === 0 ? (
					<output
						className="flex flex-col items-center justify-center py-10 text-center"
						aria-live="polite"
					>
						<p className="text-xs text-muted-foreground">
							No shortcuts found matching &ldquo;{searchQuery}&rdquo;
						</p>
					</output>
				) : (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
						{groupNames.map((group) => (
							<div key={group} className="flex flex-col gap-1.5">
								<h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
									{group}
								</h3>
								<div className="flex flex-col divide-y divide-border/40 rounded-md border border-border/40 bg-muted/20 px-3 py-1">
									{groupedItems[group].map((item) => (
										<div
											key={item.id}
											className="flex items-center justify-between gap-2 py-2"
										>
											<div className="flex min-w-0 flex-col">
												<span className="truncate text-xs font-medium text-foreground">
													{item.name || item.id}
												</span>
												{item.description && (
													<span className="truncate text-[0.6875rem] text-muted-foreground">
														{item.description}
													</span>
												)}
											</div>
											{item.formattedChord ? (
												<Kbd className="shrink-0">{item.formattedChord}</Kbd>
											) : (
												<span className="text-[0.625rem] text-muted-foreground">
													Unassigned
												</span>
											)}
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

export type HotkeysCheatsheetDialogProps = {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
};

export function HotkeysCheatsheetDialog({
	open: controlledOpen,
	onOpenChange: controlledOnOpenChange,
}: HotkeysCheatsheetDialogProps = {}) {
	const dialogScopeId = useId();
	const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

	const isControlled = controlledOpen !== undefined;
	const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

	useHotkey(
		appHotkeys["help.shortcuts"],
		() => {
			if (isControlled) {
				controlledOnOpenChange?.(!controlledOpen);
			} else {
				setUncontrolledOpen((prev) => !prev);
			}
		},
		{ ignoreInputs: "auto" },
	);

	useEffect(() => {
		const handleOpenEvent = () => {
			if (isControlled) {
				controlledOnOpenChange?.(true);
			} else {
				setUncontrolledOpen(true);
			}
		};

		window.addEventListener("workspace:open-cheatsheet", handleOpenEvent);
		return () => {
			window.removeEventListener("workspace:open-cheatsheet", handleOpenEvent);
		};
	}, [isControlled, controlledOnOpenChange]);

	const handleOpenChange = (nextOpen: boolean) => {
		if (isControlled) {
			controlledOnOpenChange?.(nextOpen);
		} else {
			setUncontrolledOpen(nextOpen);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogContent className="flex max-h-[85vh] flex-col gap-4 sm:max-w-2xl md:max-w-3xl">
				<DialogHeader>
					<DialogTitle>Keyboard Shortcuts</DialogTitle>
					<DialogDescription>
						Quick reference of all available keyboard shortcuts
					</DialogDescription>
				</DialogHeader>

				<HotkeysProvider scope={`dialog-${dialogScopeId}`} exclusive>
					<CheatsheetBody onClose={() => handleOpenChange(false)} />
				</HotkeysProvider>
			</DialogContent>
		</Dialog>
	);
}
