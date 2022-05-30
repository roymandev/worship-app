import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import dummyPlaylist from '../dummyPlaylist.json';
import { PlaylistItem } from '../types/playlistTypes';

export const playlistNameAtom = atomWithStorage(
  'playlistName',
  'Ibadah Minggu 20220530',
);

export const playlistItemsAtom = atomWithStorage<PlaylistItem[]>(
  'playlistItems',
  dummyPlaylist.items,
);

export const playlistSelectedItemIndexAtom = atom(-1);
