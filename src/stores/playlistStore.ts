import { PLAYLIST_FILE_EXT } from '@/constant';
import { atomWithLocalStorage } from '@/lib/atomWithLocalStorage';
import { downloadObject } from '@/lib/downloadObject';
import { Playlist, PlaylistItem, PlaylistSchema } from '@/schemas';
import { showNotification } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';
import { atom } from 'jotai';
import React, { SetStateAction } from 'react';

// State
const name = atomWithLocalStorage('playlistName', 'Untitled', (value) =>
  PlaylistSchema.shape.name.parse(value),
);

const items = atomWithLocalStorage<PlaylistItem[]>(
  'playlistItems',
  [],
  (storageValue) => PlaylistSchema.shape.items.parse(storageValue),
);

const selectedItemIndex = atom(
  -1,
  (get, set, update: SetStateAction<number>) => {
    const nextVal =
      typeof update === 'function' ? update(get(selectedItemIndex)) : update;

    if (get(items)[nextVal]) {
      set(selectedItemIndex, nextVal);
    }
  },
);

// Getter
const selectedItem = atom(
  (get): PlaylistItem | null => get(items)[get(selectedItemIndex)] || null,
  (get, set, update: PlaylistItem) => {
    set(
      items,
      get(items).map((item, index) =>
        index === get(selectedItemIndex) ? update : item,
      ),
    );
  },
);
const canShiftSelectedItemUp = atom(
  (get) => !!get(items)[get(selectedItemIndex) - 1],
);
const canShiftSelectedItemDown = atom(
  (get) => !!get(items)[get(selectedItemIndex) + 1],
);

// Setter
const importFromFile = atom(null, (get, set, playlist: Playlist) => {
  set(name, PlaylistSchema.shape.name.parse(playlist.name));
  set(items, PlaylistSchema.shape.items.parse(playlist.items));

  showNotification({
    color: 'green',
    icon: React.createElement(IconCheck, { size: 20 }),
    title: 'Success import playlist',
    message: playlist.name,
    autoClose: 2000,
  });
});
const downloadToFile = atom(null, (get) => {
  const playlistName = get(name);
  downloadObject(
    { name: playlistName, items: get(items) },
    (playlistName || 'Untitled') + PLAYLIST_FILE_EXT,
  );
});
const addItem = atom(null, (get, set, item: Omit<PlaylistItem, 'id'>) => {
  set(items, (prevItems) => [
    ...prevItems,
    { ...item, id: crypto.randomUUID() },
  ]);

  showNotification({
    color: 'green',
    icon: React.createElement(IconCheck, { size: 20 }),
    title: 'Success add to playlist',
    message: item.title,
    autoClose: 2000,
  });
});
const shiftSelectedItemUp = atom(null, (get, set) =>
  set(selectedItemIndex, (prevIndex) => prevIndex - 1),
);
const shiftSelectedItemDown = atom(null, (get, set) =>
  set(selectedItemIndex, (prevIndex) => prevIndex + 1),
);
const moveSelectedItemUp = atom(null, (get, set) => {
  set(items, (prevItems) => {
    const newItems = [...prevItems];
    [newItems[get(selectedItemIndex)], newItems[get(selectedItemIndex) - 1]] = [
      newItems[get(selectedItemIndex) - 1],
      newItems[get(selectedItemIndex)],
    ];
    return newItems;
  });
});
const moveSelectedItemDown = atom(null, (get, set) => {
  set(items, (prevItems) => {
    const newItems = [...prevItems];
    [newItems[get(selectedItemIndex)], newItems[get(selectedItemIndex) + 1]] = [
      newItems[get(selectedItemIndex) + 1],
      newItems[get(selectedItemIndex)],
    ];
    return newItems;
  });
});
const deleteSelectedItem = atom(null, (get, set) => {
  set(items, (prevItems) =>
    prevItems.filter((item, index) => index !== get(selectedItemIndex)),
  );

  if (get(canShiftSelectedItemUp)) set(shiftSelectedItemUp);
  else if (get(canShiftSelectedItemDown)) set(shiftSelectedItemDown);
  else set(selectedItemIndex, -1);
});

export const playlistStore = {
  name,
  items,
  selectedItemIndex,
  selectedItem,
  canShiftSelectedItemUp,
  canShiftSelectedItemDown,
  importFromFile,
  downloadToFile,
  addItem,
  shiftSelectedItemUp,
  shiftSelectedItemDown,
  moveSelectedItemUp,
  moveSelectedItemDown,
  deleteSelectedItem,
};
