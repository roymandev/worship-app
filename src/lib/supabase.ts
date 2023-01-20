import { SongItem } from '@/types';
import { createClient } from '@supabase/supabase-js';
import { parseItemContent } from '@/lib/parseItemContent';

// Create a single supabase client for interacting with your database
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY,
);

type Songs = (SongItem & {
  content: string;
})[];

export const searchSongs = async (query: string): Promise<SongItem[]> => {
  const { data: songs } = await supabase
    .from('songs')
    .select()
    .textSearch('title', query, { type: 'websearch' });

  return (songs as Songs).map((data) => ({
    ...data,
    content: parseItemContent(data.content),
  }));
};
