import { IconPresentation } from "@tabler/icons-react";
import { usePlaylistStore } from "@/features/playlist/store";
import { CueList } from "./cue-list";

export function CueListPanel() {
	const selectedItem = usePlaylistStore((s) => {
		const id = s.selectedItemId;
		return id ? s.items.find((i) => i.id === id) : null;
	});

	return (
		<section
			aria-label="Cue list panel"
			className="flex h-full w-full flex-col overflow-hidden bg-background text-foreground"
		>
			<header className="flex h-10 shrink-0 items-center gap-2 border-b px-3">
				<IconPresentation className="size-4 text-muted-foreground" />
				<h2 className="truncate font-semibold text-sm">
					{selectedItem?.title ?? "No item selected"}
				</h2>
			</header>

			<div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-2">
				<CueList
					target="stage"
					ariaLabel="Cue items"
					emptyMessage="This playlist item has no content yet."
				/>
			</div>
		</section>
	);
}
