import { SongItem } from '@/types';
import { atom } from 'jotai';

// State
export const atomSearchQuery = atom('');
export const atomSongs = atom<SongItem[]>([]);
export const atomSongsSelectedSongId = atom<SongItem['id'] | null>(null);

// Getter
export const atomSongsSelectedSong = atom<SongItem | null, SongItem>(
  (get) =>
    get(atomSongs).find((item) => item.id === get(atomSongsSelectedSongId)) ||
    null,
  (get, set, update) => {
    set(
      atomSongs,
      get(atomSongs).map((item) =>
        item.id === get(atomSongsSelectedSongId) ? update : item,
      ),
    );
  },
);
