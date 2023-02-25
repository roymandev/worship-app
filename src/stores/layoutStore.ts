import { atom } from 'jotai';

export const atomLeftPanelContent = atom<'playlist' | 'song-database'>(
  'playlist',
);
