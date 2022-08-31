import { atom } from 'jotai';
import { BaseItem } from '@/types';

// State
export const atomPreviewItem = atom<BaseItem | null>(null);
export const atomPreviewItemContentSelectedLineIndex = atom(-1);

// Getter
export const atomPreviewItemContentSelectedLine = atom(
  (get) =>
    get(atomPreviewItem)?.content[get(atomPreviewItemContentSelectedLineIndex)],
);
