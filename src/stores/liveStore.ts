import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { BaseItem } from '../types/playlistTypes';

export const liveItemAtom = atomWithStorage<BaseItem | null>('liveItem', null);

export const liveItemSelectedLineIndexAtom = atomWithStorage<number>(
  'liveItemSelectedLineIndex',
  -1,
);

// Getter
export const liveItemSelectedLineAtom = atom(
  (get) =>
    get(liveItemAtom)?.content[get(liveItemSelectedLineIndexAtom)] ?? null,
);
