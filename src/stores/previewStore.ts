import { atom } from 'jotai';
import { BaseItem } from '@/types';

export type PreviewItem = Pick<BaseItem, 'title' | 'content'>;

// State
export const atomPreviewItem = atom<PreviewItem | null>(null);
export const atomPreviewItemContentSelectedLineIndex = atom(-1);

// Getter
export const atomPreviewItemContentSelectedLine = atom(
  (get) =>
    get(atomPreviewItem)?.content[
      get(atomPreviewItemContentSelectedLineIndex)
    ] || null,
);
