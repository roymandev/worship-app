import { nanoid } from 'nanoid';
import { PlaylistItem } from '../types/playlistTypes';

export const validatePlaylistContent = (content: PlaylistItem['content']) => {
  const validatedContent: typeof content = [];

  if (typeof content === 'object') {
    content.map((line) => {
      if (typeof line.text === 'string') {
        const validatedLine: typeof line = {
          text: line.text,
        };

        if (typeof line.type === 'string') validatedLine.type = line.type;

        validatedContent.push(validatedLine);
      }
    });
  }
  return validatedContent;
};

export const validatePlaylist = (playlistItem: PlaylistItem[]) => {
  const items: PlaylistItem[] = [];

  if (playlistItem && typeof playlistItem === 'object') {
    playlistItem.forEach((item) => {
      if (typeof item.title === 'string') {
        const validatedItem: PlaylistItem = {
          id: nanoid(),
          title: item.title,
          content: validatePlaylistContent(item.content),
        };

        // set if note exist
        if (typeof item.note === 'string') validatedItem.note = item.note;

        items.push(validatedItem);
      }
    });
  }
  return items;
};
