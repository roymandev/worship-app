import { PlaylistItem } from '@/types';
import { atomWithStorage } from 'jotai/utils';

// State
export const atomPlaylistName = atomWithStorage('playlistName', 'Untitled');
export const atomPlaylistItems = atomWithStorage<PlaylistItem[]>(
  'playlistItem',
  [],
);
