import BaseInput from '@/components/BaseInput';
import BasePanelHeader from '@/components/BasePanelHeader';
import useDebouncedValue from '@/hooks/useDebouncedValue';
import { searchSongs } from '@/lib/supabase';
import { useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import {
  atomSearchQuery,
  atomSongs,
  atomSongsSelectedSongId,
} from '@/stores/searchStore';
import ResultList from '@/components/PanelSearch/ResultList';
import ListController from '@/components/PanelSearch/ListController';

const PanelSearch = () => {
  const setResult = useSetAtom(atomSongs);
  const setSelectedSongId = useSetAtom(atomSongsSelectedSongId);

  const [query, setQuery] = useAtom(atomSearchQuery);
  const debouncedQuery = useDebouncedValue(query, 1000);

  // Search song
  useEffect(() => {
    if (debouncedQuery) {
      searchSongs(debouncedQuery).then((songs) => {
        setResult(songs);
        setSelectedSongId(songs[0]?.id || null);
      });
    } else {
      setResult([]);
      setSelectedSongId(null);
    }
  }, [debouncedQuery]);

  return (
    <>
      <BasePanelHeader sub>
        <BaseInput
          className="h-7 flex-1"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs..."
        />
      </BasePanelHeader>

      <div className="flex flex-1 divide-x divide-zinc-600 overflow-hidden">
        <ResultList />
        <ListController />
      </div>
    </>
  );
};

export default PanelSearch;
