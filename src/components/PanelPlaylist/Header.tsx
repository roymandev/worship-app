import BasePanelHeader from '@/components/BasePanelHeader';
import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import ModalPlaylistImport from '@/components/Modals/ModalPlaylistImport';
import useModal from '@/hooks/useModal';
import { atomPlaylistPanelContent } from '@/stores/playlistStore';
import { useSetAtom } from 'jotai';
import { RiDownloadLine, RiUploadLine } from 'react-icons/ri';

const Header = () => {
  const setPanelContent = useSetAtom(atomPlaylistPanelContent);
  const { isOpen, openModal, closeModal } = useModal();

  return (
    <>
      <BasePanelHeader>
        <h2 className="px-1">Playlist</h2>

        <ButtonPrimary className="ml-auto" withIcon="left" onClick={openModal}>
          <RiUploadLine className="h-4 w-4" />
          Import
        </ButtonPrimary>
        <ButtonPrimary
          withIcon="left"
          onClick={() => setPanelContent('export')}
        >
          <RiDownloadLine className="h-4 w-4" />
          Export
        </ButtonPrimary>
      </BasePanelHeader>

      {isOpen && <ModalPlaylistImport onClose={closeModal} />}
    </>
  );
};

export default Header;
