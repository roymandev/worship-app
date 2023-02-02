import BaseInput from '@/components/BaseInput';
import BaseList from '@/components/BaseList';
import BaseListItem from '@/components/BaseListItem';
import BasePanelHeader from '@/components/BasePanelHeader';
import ListController from '@/components/PanelPlaylist/ListController';
import useLive from '@/hooks/useLive';
import usePlaylist from '@/hooks/usePlaylist';
import usePreview from '@/hooks/usePreview';
import { atomPlaylistSelectedItem } from '@/stores/playlistStore';
import { BaseItem } from '@/types';
import { useAtomValue } from 'jotai';
import { useEffect } from 'react';

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
      <BasePanelHeader sub>
        <BaseInput
          className="h-7 flex-1"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Playlist name"
        />
      </BasePanelHeader>

      <div className="flex flex-1 divide-x divide-zinc-700 overflow-hidden">
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
              className="select-none py-1 px-2"
              isSelected={isSelected}
              onClick={() => setSelectedItemId(item.id)}
              onDoubleClick={() => setLiveItemHandler(item)}
            >
              <h3 className="font-medium">{item.title || '(Untitled)'}</h3>
            </BaseListItem>
          )}
        />

        <ListController />
      </div>
    </>
  );
};

export default ContentList;
