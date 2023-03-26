import { atom } from 'jotai';

export const atomLeftPanelContent = atom<
  'playlist' | 'song-database' | 'settings'
>('playlist');

export const atomPlaylistPanelContent = atom<'list' | 'addItem' | 'editItem'>(
  'list',
);
