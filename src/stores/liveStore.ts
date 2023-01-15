import { PreviewItem } from '@/stores/previewStore';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// State
export const atomLiveItem = atomWithStorage<PreviewItem | null>(
  'liveItem',
  null,
);
export const atomLiveItemContentSelectedLineIndex = atomWithStorage(
  'liveItemSelectedLineIndex',
  -1,
);

// Getter
export const atomLiveItemContentSelectedLine = atom(
  (get) =>
    get(atomLiveItem)?.content[get(atomLiveItemContentSelectedLineIndex)] ||
    null,
);
