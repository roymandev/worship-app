import { BaseItem } from '@/schemas/ItemSchema';
import { atom } from 'jotai';

// State
export const atomSearchQuery = atom('');
export const atomSongs = atom<BaseItem[]>([]);
export const atomSongsSelectedSongId = atom<BaseItem['id'] | null>(null);

// Getter
export const atomSongsSelectedSong = atom(
  (get) =>
    get(atomSongs).find((item) => item.id === get(atomSongsSelectedSongId)) ||
    null,
  (get, set, update: BaseItem) => {
    set(
      atomSongs,
      get(atomSongs).map((item) =>
        item.id === get(atomSongsSelectedSongId) ? update : item,
      ),
    );
  },
);
