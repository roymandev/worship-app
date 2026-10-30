import { IconSearch } from "@tabler/icons-react";
import { HotkeysProvider, useHotkey } from "@tanstack/react-hotkeys";
import { useId, useMemo, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	AppHotkeyKbd,
	HotkeyChordKbd,
} from "@/features/workspace/app-hotkey-kbd";
import { appHotkeys } from "@/features/workspace/hotkeys";
import {
	type AppHotkeyItem,
	filterHotkeys,
	groupHotkeys,
} from "@/features/workspace/hotkeys-search";
import { useWorkspaceStore } from "@/features/workspace/store";

type CheatsheetBodyProps = {
	onClose: () => void;
};

function CheatsheetBody({ onClose }: CheatsheetBodyProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const searchInputId = useId();

	useHotkey("Escape", onClose);
	useHotkey(appHotkeys["help.shortcuts"], onClose);

	const filteredItems = useMemo(() => {
		return filterHotkeys(appHotkeys, searchQuery);
	}, [searchQuery]);

	const groupedItems = useMemo(() => {
		return groupHotkeys(filteredItems);
	}, [filteredItems]);

	const groupNames = Object.keys(groupedItems);
	const totalResults = filteredItems.length;

	const renderShortcutKbd = (item: AppHotkeyItem) => {
		if (item.id in appHotkeys) {
			return (
				<AppHotkeyKbd
					id={item.id as keyof typeof appHotkeys}
					className="shrink-0"
				/>
			);
		}

		if (item.hotkey) {
			if (typeof item.hotkey === "string") {
				return <HotkeyChordKbd chord={item.hotkey} className="shrink-0" />;
			}

			if (Array.isArray(item.hotkey)) {
				return (
					<div className="flex shrink-0 items-center gap-1">
						{item.hotkey.map((step) => (
							<HotkeyChordKbd key={`${item.id}-step-${step}`} chord={step} />
						))}
					</div>
				);
			}
		}

		return (
			<span className="text-[0.625rem] text-muted-foreground">Unassigned</span>
		);
	};

	return (
		<div className="flex max-h-[calc(85vh-5rem)] flex-col gap-4">
			<div className="relative">
				<IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground select-none" />
				<input
					id={searchInputId}
					type="search"
					// biome-ignore lint/a11y/noAutofocus: Cheatsheet search input intentionally auto-focuses on open
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
											{renderShortcutKbd(item)}
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

export function HotkeysCheatsheetDialog() {
	const dialogScopeId = useId();
	const isCheatsheetOpen = useWorkspaceStore((state) => state.isCheatsheetOpen);
	const openCheatsheet = useWorkspaceStore((state) => state.openCheatsheet);
	const closeCheatsheet = useWorkspaceStore((state) => state.closeCheatsheet);

	useHotkey(
		appHotkeys["help.shortcuts"],
		() => {
			if (isCheatsheetOpen) {
				closeCheatsheet();
			} else {
				openCheatsheet();
			}
		},
		{ ignoreInputs: "auto" },
	);

	const handleOpenChange = (nextOpen: boolean) => {
		if (!nextOpen) {
			closeCheatsheet();
		} else {
			openCheatsheet();
		}
	};

	return (
		<Dialog open={isCheatsheetOpen} onOpenChange={handleOpenChange}>
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
