import { create } from "zustand";
import { findCueIndexAtCaret, parseCues } from "@/features/playlist/cues";

export type EditorDraftState = {
	draftContent: string | null;
	caretOffset: number;
	setDraft: (content: string, caretOffset: number) => void;
	clearDraft: () => void;
};

export const INITIAL_EDITOR_DRAFT_STATE = {
	draftContent: null,
	caretOffset: 0,
} as const;

export function selectDraftDisplayText(
	draftContent: string | null,
	caretOffset: number,
): string | null {
	if (draftContent === null) {
		return null;
	}
	const cues = parseCues(draftContent);
	const activeCueIndex = findCueIndexAtCaret(draftContent, caretOffset);
	return cues[activeCueIndex] ?? null;
}

export const useEditorDraftStore = create<EditorDraftState>((set) => ({
	...INITIAL_EDITOR_DRAFT_STATE,
	setDraft: (content, caretOffset) =>
		set({ draftContent: content, caretOffset }),
	clearDraft: () => set({ draftContent: null, caretOffset: 0 }),
}));
