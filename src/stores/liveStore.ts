import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { BaseItem } from '../types/playlistTypes';

export const atomLiveItem = atomWithStorage<BaseItem | null>('liveItem', null);

export const atomLiveItemContentSelectedLineIndex = atomWithStorage<number>(
  'liveItemSelectedLineIndex',
  -1,
);

export const atomLiveHideText = atomWithStorage('liveHideText', false);
export const atomLiveHideScreen = atomWithStorage('liveHideScreen', false);

// Getter
export const atomLiveItemContentSelectedLine = atom(
  (get) =>
    get(atomLiveItem)?.content[get(atomLiveItemContentSelectedLineIndex)] ??
    null,
);
