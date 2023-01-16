import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import ModalPlaylistExport from '@/components/Modals/ModalPlaylistExport';
import ModalPlaylistImport from '@/components/Modals/ModalPlaylistImport';
import useModal from '@/hooks/useModal';
import usePlaylist from '@/hooks/usePlaylist';
import { atomPlaylistPanelContent } from '@/stores/playlistStore';
import { useSetAtom } from 'jotai';
import {
  RiAddLine,
  RiArrowDownLine,
  RiArrowUpLine,
  RiDeleteBin2Line,
  RiDownload2Line,
  RiPencilLine,
  RiUpload2Line,
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

  const {
    isOpen: isOpenImport,
    openModal: openModalImport,
    closeModal: closeModalImport,
  } = useModal();
  const {
    isOpen: isOpenExport,
    openModal: openModalExport,
    closeModal: closeModalExport,
  } = useModal();

  return (
    <>
      <div className="flex flex-col gap-1 p-1">
        <ButtonPrimary
          title="Add Playlist Item"
          tabIndex={-1}
          withIcon
          onClick={() => setPlaylistPanelContent('addItem')}
        >
          <RiAddLine className="h-4 w-4" />
        </ButtonPrimary>

        <hr className="border-zinc-600" />

        <ButtonPrimary
          title="Move Selected Item Up"
          tabIndex={-1}
          className="p-1.5"
          onClick={moveSelectedItemUp}
          disabled={!canShiftSelectedItemUp() || !selectedItemId}
        >
          <RiArrowUpLine className="h-4 w-4" />
        </ButtonPrimary>
        <ButtonPrimary
          title="Move Selected Item Down"
          tabIndex={-1}
          className="p-1.5"
          onClick={moveSelectedItemDown}
          disabled={!canShiftSelectedItemDown() || !selectedItemId}
        >
          <RiArrowDownLine className="h-4 w-4" />
        </ButtonPrimary>

        <hr className="border-zinc-600" />

        <ButtonPrimary
          title="Edit Selected Item Up"
          tabIndex={-1}
          className="p-1.5"
          disabled={!selectedItemId}
          onClick={() => setPlaylistPanelContent('editItem')}
        >
          <RiPencilLine className="h-4 w-4" />
        </ButtonPrimary>
        <ButtonPrimary
          title="Delete Selected Item Up"
          tabIndex={-1}
          className="p-1.5"
          disabled={!selectedItemId}
          onClick={deleteSelectedItem}
        >
          <RiDeleteBin2Line className="h-4 w-4" />
        </ButtonPrimary>

        <ButtonPrimary
          title="Import Playlist"
          className="mt-auto p-1.5"
          onClick={openModalImport}
        >
          <RiUpload2Line className="h-4 w-4" />
        </ButtonPrimary>
        <ButtonPrimary
          title="Export Playlist"
          className="p-1.5"
          onClick={openModalExport}
        >
          <RiDownload2Line className="h-4 w-4" />
        </ButtonPrimary>
      </div>

      <ModalPlaylistImport opened={isOpenImport} onClose={closeModalImport} />
      <ModalPlaylistExport opened={isOpenExport} onClose={closeModalExport} />
    </>
  );
};

export default ListController;
