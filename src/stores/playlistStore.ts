import { atom, Getter, Setter } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import dummyPlaylist from '../dummyPlaylist.json';
import { listController } from '../lib/listController';
import { PlaylistItem } from '../types/playlistTypes';

// State
export const playlistNameAtom = atomWithStorage(
  'playlistName',
  'Ibadah Minggu 20220530',
);
export const playlistItemsAtom = atomWithStorage<PlaylistItem[]>(
  'playlistItems',
  dummyPlaylist.items,
);
export const playlistSelectedItemIndexAtom = atom(-1);

// Getter
export const playlistSelectedItemAtom = atom<PlaylistItem | null>(
  (get) => get(playlistItemsAtom)[get(playlistSelectedItemIndexAtom)] ?? null,
);

// Playlist store actions
const playlistItemsHandler = (get: Getter, set: Setter) => {
  const playlistItems = get(playlistItemsAtom);
  return listController({
    items: playlistItems,
    selectedItemIndex: get(playlistSelectedItemIndexAtom),
    setItems: (newItems) => set(playlistItemsAtom, newItems),
    setSelectedItemIndex: (index) => set(playlistSelectedItemIndexAtom, index),
  });
};

export const playlistShiftSelectedItemUpAtom = atom(null, (get, set) => {
  const listHanlder = playlistItemsHandler(get, set);
  listHanlder.shiftSelectedItemUp();
});

export const playlistShiftSelectedItemDownAtom = atom(null, (get, set) => {
  const listHanlder = playlistItemsHandler(get, set);
  listHanlder.shiftSelectedItemDown();
});
