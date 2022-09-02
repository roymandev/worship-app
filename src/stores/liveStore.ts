import { BaseItem } from '@/types';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// State
export const atomLiveItem = atomWithStorage<BaseItem | null>('liveItem', null);
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
