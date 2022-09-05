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

  const setPreviewItemHandler = (item: BaseItem | null) => {
    setPreviewItem(item);
    setPreviewItemContentSelectedLineIndex(item?.content[0] ? 0 : -1);
  };

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

      <div className="flex flex-1 divide-x divide-slate-300">
        <BaseList
          items={items}
          selectedItemIndex={items.findIndex(
            (item) => item.id === selectedItemId,
          )}
          onSelectItem={(index) => {
            const item = items[index];
            setSelectedItemId(item.id);
            setPreviewItemHandler(item);
          }}
          onKeyDownEnter={() => setLiveItemHandler(selectedItem)}
          renderItem={(item, isSelected) => (
            <BaseListItem
              key={item.id}
              className="select-none py-1 px-2"
              isSelected={isSelected}
              onClick={() => {
                setSelectedItemId(item.id);
                setPreviewItemHandler(item);
              }}
              onDoubleClick={() => setLiveItemHandler(item)}
            >
              <h3 className="font-medium">{item.title}</h3>
              {item.note && <p className="text-slate-500">{item.note}</p>}
            </BaseListItem>
          )}
        />

        <div className="flex flex-col gap-1 p-1">
          <ButtonPrimary
            tabIndex={-1}
            color="blue"
            className="p-1.5"
            onClick={() => setPanelContent('addItem')}
          >
            <RiAddLine className="h-4 w-4" />
          </ButtonPrimary>

          <hr />

          <ButtonPrimary
            tabIndex={-1}
            color="gray"
            className="p-1.5"
            onClick={moveSelectedItemUp}
            disabled={!canShiftSelectedItemUp() || !selectedItemId}
          >
            <RiArrowUpLine className="h-4 w-4" />
          </ButtonPrimary>
          <ButtonPrimary
            tabIndex={-1}
            color="gray"
            className="p-1.5"
            onClick={moveSelectedItemDown}
            disabled={!canShiftSelectedItemDown() || !selectedItemId}
          >
            <RiArrowDownLine className="h-4 w-4" />
          </ButtonPrimary>

          <hr />

          <ButtonPrimary
            tabIndex={-1}
            color="gray"
            className="p-1.5"
            onClick={() => setPanelContent('editItem')}
            disabled={!selectedItemId}
          >
            <RiPencilLine className="h-4 w-4" />
          </ButtonPrimary>
          <ButtonPrimary
            tabIndex={-1}
            color="red"
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