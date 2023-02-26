import BaseList from '@/components/BaseList';
import BaseListItem from '@/components/BaseListItem';
import BasePanelHeader from '@/components/BasePanelHeader';
import useLive from '@/hooks/useLive';
import usePlaylist from '@/hooks/usePlaylist';
import usePreview from '@/hooks/usePreview';
import { atomPlaylistSelectedItem } from '@/stores/playlistStore';
import { BaseItem } from '@/types';
import { useAtomValue } from 'jotai';
import { useEffect } from 'react';
import BasePanelHeaderInput from '@/components/BasePanelHeaderInput';
import { IconPencil } from '@tabler/icons-react';
import { Divider, Flex, Text } from '@mantine/core';
import ListController from './ListController';

const ContentList = () => {
  const preview = usePreview();
  const live = useLive();
  const { name, setName, items, selectedItemId, setSelectedItemId } =
    usePlaylist();
  const selectedItem = useAtomValue(atomPlaylistSelectedItem);

  useEffect(() => {
    const item = items.find((item) => item.id === selectedItemId) || null;
    preview.show(item);
  }, [selectedItemId]);

  const setLiveItemHandler = (item: BaseItem | null) => {
    live.show(item);
  };

  return (
    <>
      <BasePanelHeader sub px={0}>
        <BasePanelHeaderInput
          placeholder="Playlist name"
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
          rightSection={<IconPencil size={18} />}
        />
      </BasePanelHeader>

      <Flex sx={{ flexGrow: 1 }} justify="stretch">
        <BaseList
          items={items}
          selectedItemIndex={items.findIndex(
            (item) => item.id === selectedItemId,
          )}
          onSelectItem={(item) => setSelectedItemId(item.id)}
          onKeyDownEnter={() => setLiveItemHandler(selectedItem)}
          renderItem={(item, isSelected) => (
            <BaseListItem
              key={item.id}
              isSelected={isSelected}
              onClick={() => setSelectedItemId(item.id)}
              onDoubleClick={() => setLiveItemHandler(item)}
            >
              <Text fz={14} fw={500} lh="inherit">
                {item.title || '(Untitled)'}
              </Text>
            </BaseListItem>
          )}
        />
        <Divider orientation="vertical" />

        <ListController />
      </Flex>
    </>
  );
};

export default ContentList;
