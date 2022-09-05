import { SongItem } from '@/types';
import { atom } from 'jotai';

export const atomSongs = atom<SongItem[]>([]);

export const atomDatabasePanelContent = atom<'editItem' | null>(null);
