import { PlaylistItem } from '@/types';
import { nanoid } from 'nanoid';

export const validatePlaylistItemContent = (
  content: PlaylistItem['content'],
) => {
  if (!Array.isArray(content)) return [];

  return content.filter((line) => {
    // exclude line if text is not string
    if (typeof line.text !== 'string') return;

    return line;
  });
};

export const validatePlaylistItems = (items: PlaylistItem[]) => {
  if (!Array.isArray(items)) return;

  return items.filter((item) => {
    const content = validatePlaylistItemContent(item.content);

    // exlude item if no title and no content
    if (!item.title && !content.length) return;

    return { ...item, id: nanoid(), content: content };
  });
};
