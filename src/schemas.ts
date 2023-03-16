import { z } from 'zod';

export const PlaylistItemContentSchema = z.object({
  text: z.string().catch('-'),
  type: z.string().optional().catch(undefined),
});

export const PlaylistItemSchema = z.object({
  id: z.string().catch(crypto.randomUUID()),
  title: z.string().catch('Untitled'),
  content: z.array(PlaylistItemContentSchema).catch([]),
});

export const PlaylistSchema = z.object({
  name: z.string().catch('Untitled'),
  items: z.array(PlaylistItemSchema).catch([]),
});

export type Playlist = z.infer<typeof PlaylistSchema>;
export type PlaylistItem = z.infer<typeof PlaylistItemSchema>;
export type PlaylistItemContent = z.infer<typeof PlaylistItemContentSchema>;
