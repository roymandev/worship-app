import { atom, Getter, Setter } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import dummyPlaylist from '../dummyPlaylist.json';
import { listController } from '../lib/listController';
import { PlaylistItem } from '../types/playlistTypes';

// State
export const atomPlaylistName = atomWithStorage(
  'playlistName',
  'Ibadah Minggu 20220530',
);
export const atomPlaylistItems = atomWithStorage<PlaylistItem[]>(
  'playlistItems',
  dummyPlaylist.items,
);
export const atomPlaylistSelectedItemIndex = atom(-1);

// Getter
export const atomPlaylistSelectedItem = atom<PlaylistItem | null, PlaylistItem>(
  (get) => get(atomPlaylistItems)[get(atomPlaylistSelectedItemIndex)] ?? null,
  (get, set, update) => {
    set(
      atomPlaylistItems,
      get(atomPlaylistItems).map((item, index) =>
        index === get(atomPlaylistSelectedItemIndex) ? update : item,
      ),
    );
  },
);

// Playlist store actions
const playlistItemsHandler = (get: Getter, set: Setter) => {
  const playlistItems = get(atomPlaylistItems);
  return listController({
    items: playlistItems,
    selectedItemIndex: get(atomPlaylistSelectedItemIndex),
    setItems: (newItems) => set(atomPlaylistItems, newItems),
    setSelectedItemIndex: (index) => set(atomPlaylistSelectedItemIndex, index),
  });
};

export const atomPlaylistShiftSelectedItemUp = atom(null, (get, set) => {
  const listHanlder = playlistItemsHandler(get, set);
  listHanlder.shiftSelectedItemUp();
});

export const atomPlaylistShiftSelectedItemDown = atom(null, (get, set) => {
  const listHanlder = playlistItemsHandler(get, set);
  listHanlder.shiftSelectedItemDown();
});
