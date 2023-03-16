import BaseList from '@/components/BaseList';
import BaseListItem from '@/components/BaseListItem';
import { liveStore } from '@/stores/liveStore';
import { previewStore } from '@/stores/previewStore';
import {
  atomSearchQuery,
  atomSongs,
  atomSongsSelectedSong,
  atomSongsSelectedSongId,
} from '@/stores/songsStore';
import { SongItem } from '@/types';
import { Group, Text, ThemeIcon } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';

const ResultList = () => {
  const searchQuery = useAtomValue(atomSearchQuery);
  const showPreview = useSetAtom(previewStore.show);
  const showLive = useSetAtom(liveStore.show);

  const result = useAtomValue(atomSongs);
  const [selectedSongId, setSelectedSongId] = useAtom(atomSongsSelectedSongId);
  const selectedSong = useAtomValue(atomSongsSelectedSong);

  // Set Preview
  useEffect(() => {
    showPreview(selectedSong);
  }, [selectedSong]);

  if (searchQuery && !result.length)
    return (
      <Group p="xs" noWrap spacing="sm">
        <ThemeIcon variant="light" color="yellow" size="lg">
          <IconInfoCircle size={18} />
        </ThemeIcon>
        <Text fz={14}>Songs not found.</Text>
      </Group>
    );

  return (
    <BaseList<SongItem>
      items={result}
      selectedItemIndex={result.findIndex((item) => item.id === selectedSongId)}
      onSelectItem={(item) => setSelectedSongId(item.id)}
      onKeyDownEnter={() => showLive(selectedSong)}
      renderItem={(item, isSelected) => (
        <BaseListItem
          key={item.id}
          isSelected={isSelected}
          onClick={() => setSelectedSongId(item.id)}
          onDoubleClick={() => showLive(item)}
        >
          <Text fz={14} fw={500}>
            {item.title || '(Untitled)'}
          </Text>
        </BaseListItem>
      )}
    />
  );
};

export default ResultList;
