import ResultList from '@/components/PanelSongs/ResultList';
import SearchInput from '@/components/PanelSongs/SearchInput';
import BasePanelHeader from '../BasePanelHeader';
import { IconMusic, IconPlaylistAdd } from '@tabler/icons-react';
import { ActionIcon, Title, Tooltip } from '@mantine/core';
import { useAtomValue, useSetAtom } from 'jotai';
import { atomSongsSelectedSong } from '@/stores/songsStore';
import { playlistStore } from '@/stores/playlistStore';

const PanelSongs = () => {
  const selectedSong = useAtomValue(atomSongsSelectedSong);
  const addItem = useSetAtom(playlistStore.addItem);

  return (
    <>
      <BasePanelHeader>
        <IconMusic size={18} />
        <Title size="h6" weight="normal">
          Song database
        </Title>

        <Tooltip label="Add to playlist">
          <ActionIcon
            size="md"
            variant="filled"
            ml="auto"
            mr="-6px"
            disabled={!selectedSong}
            onClick={() => selectedSong && addItem(selectedSong)}
            sx={{
              '&[disabled]': {
                pointerEvents: 'all',
              },
            }}
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
