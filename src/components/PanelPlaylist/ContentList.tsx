import BaseList from '@/components/BaseList';
import BaseListItem from '@/components/BaseListItem';
import BasePanelHeader from '@/components/BasePanelHeader';
import useLive from '@/hooks/useLive';
import { BaseItem } from '@/types';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import BasePanelHeaderInput from '@/components/BasePanelHeaderInput';
import { IconPencil } from '@tabler/icons-react';
import { Divider, Flex, Text } from '@mantine/core';
import ListController from './ListController';
import { playlistAtom } from '@/stores/playlistStore';
import { previewStore } from '@/stores/previewStore';

const ContentList = () => {
  const showPreview = useSetAtom(previewStore.show);
  const live = useLive();
  const [name, setName] = useAtom(playlistAtom.name);
  const items = useAtomValue(playlistAtom.items);
  const [selectedItemIndex, setSelectedItemIndex] = useAtom(
    playlistAtom.selectedItemIndex,
  );
  const selectedItem = useAtomValue(playlistAtom.selectedItem);

  useEffect(() => {
    showPreview(selectedItem);
  }, [selectedItem]);

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
          selectedItemIndex={selectedItemIndex}
          onSelectItem={(item, index) => setSelectedItemIndex(index)}
          onKeyDownEnter={() => setLiveItemHandler(selectedItem)}
          renderItem={(item, isSelected, index) => (
            <BaseListItem
              key={item.id}
              isSelected={isSelected}
              onClick={() => setSelectedItemIndex(index)}
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
