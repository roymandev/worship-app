import ResultList from '@/components/PanelSongs/ResultList';
import SearchInput from '@/components/PanelSongs/SearchInput';
import BasePanelHeader from '../BasePanelHeader';
import { IconMusic, IconPlaylistAdd } from '@tabler/icons-react';
import { ActionIcon, Title, Tooltip } from '@mantine/core';
import { useAtomValue } from 'jotai';
import { atomSongsSelectedSong } from '@/stores/songsStore';
import usePlaylist from '@/hooks/usePlaylist';

const PanelSongs = () => {
  const selectedSong = useAtomValue(atomSongsSelectedSong);
  const { addItem } = usePlaylist();

  return (
    <>
      <BasePanelHeader>
        <IconMusic size={18} />
        <Title size="h6" weight="normal">
          Song database
        </Title>

        <Tooltip label="Add to playlist">
          <ActionIcon
            color="blue"
            size="md"
            variant="filled"
            ml="auto"
            mr="-6px"
            disabled={!selectedSong}
            onClick={() => selectedSong && addItem(selectedSong)}
          >
            <IconPlaylistAdd size={18} />
          </ActionIcon>
        </Tooltip>
      </BasePanelHeader>

      <SearchInput />

      <ResultList />
    </>
  );
};

export default PanelSongs;
