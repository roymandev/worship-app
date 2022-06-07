import { atom } from 'jotai';
import { BaseItem } from '../types/playlistTypes';

export const atomPreviewItem = atom<BaseItem | null>(null);
export const atomPreviewItemContentSelectedLineIndex = atom(-1);
