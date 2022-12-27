import BaseInput from '@/components/BaseInput';
import BaseList from '@/components/BaseList';
import BaseListItem from '@/components/BaseListItem';
import BasePanelHeader from '@/components/BasePanelHeader';
import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import usePlaylist from '@/hooks/usePlaylist';
import {
  atomLiveItem,
  atomLiveItemContentSelectedLineIndex,
} from '@/stores/liveStore';
import {
  atomPlaylistPanelContent,
  atomPlaylistSelectedItem,
} from '@/stores/playlistStore';
import {
  atomPreviewItem,
  atomPreviewItemContentSelectedLineIndex,
} from '@/stores/previewStore';
import { BaseItem } from '@/types';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import {
  RiAddLine,
  RiArrowDownLine,
  RiArrowUpLine,
  RiDeleteBin2Line,
  RiPencilLine,
} from 'react-icons/ri';

const ContentList = () => {
  const setPreviewItem = useSetAtom(atomPreviewItem);
  const setPreviewItemContentSelectedLineIndex = useSetAtom(
    atomPreviewItemContentSelectedLineIndex,
  );
  const setLiveItem = useSetAtom(atomLiveItem);
  const setLiveItemContentSelectedLineIndex = useSetAtom(
    atomLiveItemContentSelectedLineIndex,
  );
  const setPanelContent = useSetAtom(atomPlaylistPanelContent);
  const {
    name,
    setName,
    items,
    selectedItemId,
    setSelectedItemId,
    canShiftSelectedItemUp,
    canShiftSelectedItemDown,
    deleteSelectedItem,
    moveSelectedItemUp,
    moveSelectedItemDown,
  } = usePlaylist();
  const selectedItem = useAtomValue(atomPlaylistSelectedItem);

  useEffect(() => {
    const item = items.find((item) => item.id === selectedItemId) || null;
    setPreviewItem(item);
    setPreviewItemContentSelectedLineIndex(item?.content[0] ? 0 : -1);
  }, [selectedItemId]);

  const setLiveItemHandler = (item: BaseItem | null) => {
    setLiveItem(item);
    setLiveItemContentSelectedLineIndex(item?.content[0] ? 0 : -1);
  };

  return (
    <>
      <BasePanelHeader sub>
        <BaseInput
          className="h-7 flex-1 px-1"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Playlist name"
        />
      </BasePanelHeader>

      <div className="flex flex-1 divide-x divide-zinc-600 overflow-hidden">
        <BaseList
          items={items}
          selectedItemIndex={items.findIndex(
            (item) => item.id === selectedItemId,
          )}
          onSelectItem={(index) => setSelectedItemId(items[index]?.id || null)}
          onKeyDownEnter={() => setLiveItemHandler(selectedItem)}
          renderItem={(item, isSelected) => (
            <BaseListItem
              key={item.id}
              className="select-none py-1 px-2"
              isSelected={isSelected}
              onClick={() => setSelectedItemId(item.id)}
              onDoubleClick={() => setLiveItemHandler(item)}
            >
              <h3 className="font-medium">{item.title}</h3>
            </BaseListItem>
          )}
        />

        <div className="flex flex-col gap-1 p-1">
          <ButtonPrimary
            tabIndex={-1}
            withIcon
            onClick={() => setPanelContent('addItem')}
          >
            <RiAddLine className="h-4 w-4" />
          </ButtonPrimary>

          <hr className="border-zinc-600" />

          <ButtonPrimary
            tabIndex={-1}
            className="p-1.5"
            onClick={moveSelectedItemUp}
            disabled={!canShiftSelectedItemUp() || !selectedItemId}
          >
            <RiArrowUpLine className="h-4 w-4" />
          </ButtonPrimary>
          <ButtonPrimary
            tabIndex={-1}
            className="p-1.5"
            onClick={moveSelectedItemDown}
            disabled={!canShiftSelectedItemDown() || !selectedItemId}
          >
            <RiArrowDownLine className="h-4 w-4" />
          </ButtonPrimary>

          <hr className="border-zinc-600" />

          <ButtonPrimary
            tabIndex={-1}
            className="p-1.5"
            onClick={() => setPanelContent('editItem')}
            disabled={!selectedItemId}
          >
            <RiPencilLine className="h-4 w-4" />
          </ButtonPrimary>
          <ButtonPrimary
            tabIndex={-1}
            className="p-1.5"
            onClick={deleteSelectedItem}
            disabled={!selectedItemId}
          >
            <RiDeleteBin2Line className="h-4 w-4" />
          </ButtonPrimary>
        </div>
      </div>
    </>
  );
};

export default ContentList;
