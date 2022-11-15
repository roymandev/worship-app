import BasePanelHeader from '@/components/BasePanelHeader';
import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import ModalPlaylistExport from '@/components/Modals/ModalPlaylistExport';
import ModalPlaylistImport from '@/components/Modals/ModalPlaylistImport';
import useModal from '@/hooks/useModal';
import { RiDownloadLine, RiUploadLine } from 'react-icons/ri';

const Header = () => {
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
      <BasePanelHeader>
        <h2 className="px-1">Playlist</h2>

        <ButtonPrimary
          className="ml-auto"
          withIcon="left"
          onClick={openModalImport}
        >
          <RiUploadLine className="h-4 w-4" />
          Import
        </ButtonPrimary>
        <ButtonPrimary withIcon="left" onClick={openModalExport}>
          <RiDownloadLine className="h-4 w-4" />
          Export
        </ButtonPrimary>
      </BasePanelHeader>

      {isOpenImport && <ModalPlaylistImport onClose={closeModalImport} />}
      {isOpenExport && <ModalPlaylistExport onClose={closeModalExport} />}
    </>
  );
};

export default Header;
