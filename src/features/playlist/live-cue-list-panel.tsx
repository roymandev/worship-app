import { IconVideo } from "@tabler/icons-react";
import { EmptyState } from "@/components/ui/empty";
import { usePlaylistStore } from "@/features/playlist/store";
import { CueList } from "./cue-list";

export function LiveCueListPanel() {
	const liveItem = usePlaylistStore((s) => {
		const id = s.liveItemId;
		return id ? s.items.find((i) => i.id === id) : null;
	});

	return (
		<section
			aria-label="Live cue list panel"
			className="flex h-full w-full flex-col overflow-hidden bg-background text-foreground"
		>
			<header className="flex h-10 shrink-0 items-center gap-2 border-b px-3">
				<IconVideo className="size-4 text-muted-foreground" />
				<h2 className="truncate font-semibold text-sm">
					{liveItem?.title ?? "No active live item"}
				</h2>
			</header>

			<div className="min-h-0 flex-1 overflow-y-auto p-2">
				{!liveItem ? (
					<EmptyState
						className="border-none"
						icon={<IconVideo className="size-4" />}
						title="No live item"
						description="Double-click an item or cue to go live."
					/>
				) : (
					<CueList
						target="live"
						ariaLabel="Live cue items"
						emptyMessage="This active live item has no cues."
					/>
				)}
			</div>
		</section>
	);
}
