import { PlaylistItem } from '@/types';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// State
export const atomPlaylistName = atomWithStorage('playlistName', 'Untitled');

export const atomPlaylistItems = atomWithStorage<PlaylistItem[]>(
  'playlistItem',
  [],
);

export const atomPlaylistSelectedItemId = atomWithStorage<
  PlaylistItem['id'] | null
>('playlistSelectedItemId', null);

export const atomPlaylistPanelContent = atom<
  'list' | 'import' | 'export' | 'editItem' | 'addItem'
>('list');

// Getter
export const atomPlaylistSelectedItem = atom<PlaylistItem | null, PlaylistItem>(
  (get) =>
    get(atomPlaylistItems).find(
      (item) => item.id === get(atomPlaylistSelectedItemId),
    ) || null,
  (get, set, update) => {
    set(
      atomPlaylistItems,
      get(atomPlaylistItems).map((item) =>
        item.id === get(atomPlaylistSelectedItemId) ? update : item,
      ),
    );
  },
);
