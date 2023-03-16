import { PreviewItem } from '@/stores/previewStore';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// State
const item = atomWithStorage<PreviewItem | null>('liveItem', null);
const selectedLineIndex = atomWithStorage('liveItemSelectedLineIndex', -1);

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

export const liveStore = {
  item,
  selectedLineIndex,
  selectedLine,
  show,
};
