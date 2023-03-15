import { atomWithLocalStorage } from '@/lib/atomWithLocalStorage';
import { PlaylistItem, PlaylistSchema } from '@/schemas';
import { atom } from 'jotai';

// State
export const atomPlaylistName = atomWithLocalStorage(
  'playlistName',
  'Untitled',
  (value) => PlaylistSchema.shape.name.parse(value),
);

export const atomPlaylistItems = atomWithLocalStorage<PlaylistItem[]>(
  'playlistItems',
  [],
  (storageValue) => PlaylistSchema.shape.items.parse(storageValue),
);

export const atomPlaylistSelectedItemId = atom<PlaylistItem['id'] | null>(null);

// Getter
export const atomPlaylistSelectedItem = atom(
  (get) =>
    get(atomPlaylistItems).find(
      (item) => item.id === get(atomPlaylistSelectedItemId),
    ) || null,
  (get, set, update: PlaylistItem) => {
    set(
      atomPlaylistItems,
      get(atomPlaylistItems).map((item) =>
        item.id === get(atomPlaylistSelectedItemId) ? update : item,
      ),
    );
  },
);
