import { SongItem } from '@/types';
import { atom } from 'jotai';

// State
export const atomSongs = atom<SongItem[]>([]);
export const atomSongsSelectedItemId = atom<string | null>(null);

export const atomDatabasePanelContent = atom<'editItem' | null>(null);

// Getter
export const atomSongsSelectedItem = atom<SongItem | null, SongItem>(
  (get) =>
    get(atomSongs).find((item) => item.id === get(atomSongsSelectedItemId)) ||
    null,
  (get, set, update) => {
    set(
      atomSongs,
      get(atomSongs).map((item) =>
        item.id === get(atomSongsSelectedItemId) ? update : item,
      ),
    );
  },
);
