import { atom, Getter, Setter } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { listController } from '../lib/listController';
import { PlaylistItem } from '../types/playlistTypes';

// State
export const atomPlaylistName = atomWithStorage('playlistName', 'Untitled');
export const atomPlaylistItems = atomWithStorage<PlaylistItem[]>(
  'playlistItems',
  [],
);
export const atomPlaylistSelectedItemIndex = atom(-1);
export const atomPlaylistPanelContent = atom<
  'list' | 'import' | 'itemEditor' | 'addItem'
>('list');

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

// Setter
export const atomPlaylistAddItem = atom(
  null,
  (get, set, item: PlaylistItem) => {
    set(atomPlaylistItems, [...get(atomPlaylistItems), item]);
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
