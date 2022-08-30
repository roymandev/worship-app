import { PlaylistItem } from '@/types';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// State
export const atomPlaylistName = atomWithStorage('playlistName', 'Untitled');
export const atomPlaylistItems = atomWithStorage<PlaylistItem[]>(
  'playlistItem',
  [],
);
export const atomPlaylistPanelContent = atom<
  'list' | 'import' | 'export' | 'editItem' | 'addItem'
>('list');
