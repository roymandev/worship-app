import { searchSongs } from '@/lib/supabase';
import { useRef, useState } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import {
  atomSearchQuery,
  atomSongs,
  atomSongsSelectedSongId,
} from '@/stores/searchStore';
import BaseInput from '@/components/BaseInput';
import BasePanelHeader from '@/components/BasePanelHeader';
import { RiLoader4Fill } from 'react-icons/ri';

const Header = () => {
  const setResult = useSetAtom(atomSongs);
  const setSelectedSongId = useSetAtom(atomSongsSelectedSongId);
  const [isLoading, setIsLoading] = useState(false);

  const [query, setQuery] = useAtom(atomSearchQuery);
  const timeoutIdRef = useRef<NodeJS.Timeout>();

  const cancelSearch = () => clearTimeout(timeoutIdRef.current);

  const onChangeHanlder: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const inputValue = e.target.value;
    setQuery(inputValue);
    cancelSearch();

    timeoutIdRef.current = setTimeout(async () => {
      setIsLoading(true);

      const songs = await searchSongs(inputValue);

      setResult(songs);
      setSelectedSongId(songs[0]?.id || null);

      setIsLoading(false);
    }, 1000);
  };

  return (
    <BasePanelHeader sub className="relative">
      <BaseInput
        className="h-7 flex-1 pr-8"
        value={query}
        onChange={onChangeHanlder}
        placeholder="Search songs..."
      />

      {isLoading && (
        <RiLoader4Fill className="absolute right-3 h-4 w-4 animate-spin" />
      )}
    </BasePanelHeader>
  );
};

export default Header;
