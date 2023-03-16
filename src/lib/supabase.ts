import { createClient } from '@supabase/supabase-js';
import { parseItemContent } from '@/lib/parseItemContent';
import { BaseItem } from '@/schemas/ItemSchema';

// Create a single supabase client for interacting with your database
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY,
);

type Songs = (BaseItem & {
  content: string;
})[];

export const searchSongs = async (query: string): Promise<BaseItem[]> => {
  const { data: songs } = await supabase.rpc('search-songs', { query: query });

  return (songs as Songs).map((data) => ({
    ...data,
    content: parseItemContent(data.content),
  }));
};
