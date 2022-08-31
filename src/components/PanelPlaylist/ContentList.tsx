import BaseInput from '@/components/BaseInput';
import BaseList from '@/components/BaseList';
import BaseListItem from '@/components/BaseListItem';
import BasePanelHeader from '@/components/BasePanelHeader';
import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import usePlaylist from '@/components/hooks/usePlaylist';
import { atomPlaylistPanelContent } from '@/stores/playlistStore';
import { useSetAtom } from 'jotai';
import {
  RiAddLine,
  RiArrowDownLine,
  RiArrowUpLine,
  RiDeleteBin2Line,
  RiPencilLine,
} from 'react-icons/ri';

const ContentList = () => {
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
          onSelectItem={(index) => setSelectedItemId(items[index].id)}
          renderItem={(item, isSelected) => (
            <BaseListItem
              key={item.id}
              className="select-none py-1 px-2"
              isSelected={isSelected}
              onClick={() => setSelectedItemId(item.id)}
            >
              {item.title}
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
