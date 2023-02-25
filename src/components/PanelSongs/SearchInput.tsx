import { searchSongs } from '@/lib/supabase';
import { useRef, useState } from 'react';
import { useSetAtom } from 'jotai';
import {
  atomSearchQuery,
  atomSongs,
  atomSongsSelectedSongId,
} from '@/stores/songsStore';
import BasePanelHeader from '@/components/BasePanelHeader';
import BasePanelHeaderInput from '../BasePanelHeaderInput';
import { IconSearch } from '@tabler/icons-react';
import { Loader } from '@mantine/core';

const SearchInput = () => {
  const setResult = useSetAtom(atomSongs);
  const setSelectedSongId = useSetAtom(atomSongsSelectedSongId);
  const [isLoading, setIsLoading] = useState(false);

  const [searchValue, setSearchValue] = useState('');
  const setQuery = useSetAtom(atomSearchQuery);
  const timeoutIdRef = useRef<NodeJS.Timeout>();

  const cancelSearch = () => clearTimeout(timeoutIdRef.current);

  const onChangeHanlder: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const inputValue = e.target.value;
    setSearchValue(inputValue);
    setQuery('');
    cancelSearch();

    timeoutIdRef.current = setTimeout(async () => {
      setIsLoading(true);

      const songs = await searchSongs(inputValue);

      setQuery(inputValue);
      setResult(songs);
      setSelectedSongId(songs[0]?.id || null);

      setIsLoading(false);
    }, 1000);
  };

  return (
    <BasePanelHeader sub px={0}>
      <BasePanelHeaderInput
        placeholder="Search title or lyrics"
        value={searchValue}
        onChange={onChangeHanlder}
        rightSection={
          isLoading ? <Loader size={18} /> : <IconSearch size={18} />
        }
      />
    </BasePanelHeader>
  );
};

export default SearchInput;
