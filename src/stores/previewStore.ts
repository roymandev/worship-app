import { atom } from 'jotai';
import { BaseItem } from '@/types';

export type PreviewItem = Pick<BaseItem, 'title' | 'content'>;

// State
const item = atom<PreviewItem | null>(null);
const selectedLineIndex = atom(-1);

// Getter
const selectedLine = atom(
  (get) => get(item)?.content[get(selectedLineIndex)] || null,
);

// Setter
const show = atom<
  null,
  [newItem: PreviewItem | null, lineIndex?: number],
  void
>(null, (get, set, newItem, lineIndex = 0) => {
  set(item, newItem);
  set(selectedLineIndex, lineIndex);
});

export const previewStore = {
  item,
  selectedLineIndex,
  selectedLine,
  show,
};
