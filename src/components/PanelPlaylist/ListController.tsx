import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import usePlaylist from '@/hooks/usePlaylist';
import { atomPlaylistPanelContent } from '@/stores/playlistStore';
import { useSetAtom } from 'jotai';
import {
  RiAddLine,
  RiArrowDownLine,
  RiArrowUpLine,
  RiDeleteBin2Line,
  RiPencilLine,
} from 'react-icons/ri';

const ListController = () => {
  const setPlaylistPanelContent = useSetAtom(atomPlaylistPanelContent);

  const {
    selectedItemId,
    canShiftSelectedItemUp,
    canShiftSelectedItemDown,
    moveSelectedItemUp,
    moveSelectedItemDown,
    deleteSelectedItem,
  } = usePlaylist();

  return (
    <>
      <div className="flex flex-col gap-1 p-1">
        <ButtonPrimary
          tabIndex={-1}
          withIcon
          onClick={() => setPlaylistPanelContent('addItem')}
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
          disabled={!selectedItemId}
          onClick={() => setPlaylistPanelContent('editItem')}
        >
          <RiPencilLine className="h-4 w-4" />
        </ButtonPrimary>
        <ButtonPrimary
          tabIndex={-1}
          className="p-1.5"
          disabled={!selectedItemId}
          onClick={deleteSelectedItem}
        >
          <RiDeleteBin2Line className="h-4 w-4" />
        </ButtonPrimary>
      </div>
    </>
  );
};

export default ListController;
