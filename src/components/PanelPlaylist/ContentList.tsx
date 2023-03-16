import BaseList from '@/components/BaseList';
import BaseListItem from '@/components/BaseListItem';
import BasePanelHeader from '@/components/BasePanelHeader';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import BasePanelHeaderInput from '@/components/BasePanelHeaderInput';
import { IconPencil } from '@tabler/icons-react';
import { Divider, Flex, Text } from '@mantine/core';
import ListController from './ListController';
import { playlistStore } from '@/stores/playlistStore';
import { previewStore } from '@/stores/previewStore';
import { liveStore } from '@/stores/liveStore';

const ContentList = () => {
  const showPreview = useSetAtom(previewStore.show);
  const showLive = useSetAtom(liveStore.show);
  const [name, setName] = useAtom(playlistStore.name);
  const items = useAtomValue(playlistStore.items);
  const [selectedItemIndex, setSelectedItemIndex] = useAtom(
    playlistStore.selectedItemIndex,
  );
  const selectedItem = useAtomValue(playlistStore.selectedItem);

  useEffect(() => {
    showPreview(selectedItem);
  }, [selectedItem]);

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
          selectedItemIndex={selectedItemIndex}
          onSelectItem={(item, index) => setSelectedItemIndex(index)}
          onKeyDownEnter={() => showLive(selectedItem)}
          renderItem={(item, isSelected, index) => (
            <BaseListItem
              key={item.id}
              isSelected={isSelected}
              onClick={() => setSelectedItemIndex(index)}
              onDoubleClick={() => showLive(item)}
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
