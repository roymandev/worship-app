import { IconSearch } from "@tabler/icons-react";
import {
	HotkeysProvider,
	useAppHotkeys,
	useHotkey,
} from "@tanstack/react-hotkeys";
import { useId, useMemo, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { HotkeysKbd } from "@/components/ui/kbd";
import { appHotkeys } from "@/features/workspace/hotkeys";

export type HotkeysCheatsheetDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

type CheatsheetBodyProps = {
	onClose: () => void;
};

function CheatsheetBody({ onClose }: CheatsheetBodyProps) {
	const registeredHotkeys = useAppHotkeys();
	const [searchQuery, setSearchQuery] = useState("");
	const searchInputId = useId();

	useHotkey("Escape", onClose);
	useHotkey(appHotkeys["help.shortcuts"], onClose);

	const items = useMemo(() => {
		return Object.entries(registeredHotkeys).map(([id, item]) => ({
			id,
			hotkey: item.hotkey,
			meta: item.meta as {
				name?: string;
				description?: string;
				group?: string;
			},
		}));
	}, [registeredHotkeys]);

	const filteredItems = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();
		if (!query) {
			return items;
		}

		return items.filter((item) => {
			const name = item.meta?.name?.toLowerCase() ?? "";
			const description = item.meta?.description?.toLowerCase() ?? "";
			const group = item.meta?.group?.toLowerCase() ?? "";
			const hotkeyStr = Array.isArray(item.hotkey)
				? item.hotkey.join(" ")
				: typeof item.hotkey === "string"
					? item.hotkey
					: "";
			const hotkeyChord = hotkeyStr.toLowerCase();

			return (
				name.includes(query) ||
				description.includes(query) ||
				group.includes(query) ||
				hotkeyChord.includes(query)
			);
		});
	}, [items, searchQuery]);

	const groupedItems = useMemo(() => {
		const groups: Record<string, typeof filteredItems> = {};
		for (const item of filteredItems) {
			const group = item.meta?.group || "General";
			if (!groups[group]) {
				groups[group] = [];
			}
			groups[group].push(item);
		}
		return groups;
	}, [filteredItems]);

	const groupNames = Object.keys(groupedItems);

	return (
		<div className="flex max-h-[calc(85vh-5rem)] flex-col gap-4">
			<div className="relative">
				<IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground select-none" />
				<input
					id={searchInputId}
					type="search"
					data-autofocus
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					placeholder="Search shortcuts..."
					className="focus-ring h-9 w-full rounded-md border border-input bg-background pr-3 pl-9 text-xs text-foreground placeholder:text-muted-foreground"
				/>
			</div>

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
													{item.meta?.name ?? item.id}
												</span>
												{item.meta?.description && (
													<span className="truncate text-[0.6875rem] text-muted-foreground">
														{item.meta.description}
													</span>
												)}
											</div>
											{item.hotkey ? (
												typeof item.hotkey === "string" ? (
													<HotkeysKbd
														chord={item.hotkey}
														className="shrink-0"
													/>
												) : (
													<div className="flex shrink-0 items-center gap-1">
														{item.hotkey.map((step) => (
															<HotkeysKbd
																key={`${item.id}-step-${step}`}
																chord={step}
															/>
														))}
													</div>
												)
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

export function HotkeysCheatsheetDialog({
	open,
	onOpenChange,
}: HotkeysCheatsheetDialogProps) {
	const dialogScopeId = useId();

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="flex max-h-[85vh] flex-col gap-4 sm:max-w-2xl md:max-w-3xl">
				<DialogHeader>
					<DialogTitle>Keyboard Shortcuts</DialogTitle>
					<DialogDescription>
						Quick reference of all available keyboard shortcuts
					</DialogDescription>
				</DialogHeader>

				<HotkeysProvider scope={`dialog-${dialogScopeId}`} exclusive>
					<CheatsheetBody onClose={() => onOpenChange(false)} />
				</HotkeysProvider>
			</DialogContent>
		</Dialog>
	);
}
