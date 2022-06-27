import { atom } from 'jotai';

export const atomContextMenuActive = atom<
  'playlistItem' | 'databaseItem' | null
>(null);
export const atomContextMenuPos = atom({
  top: 100,
  left: 100,
});
