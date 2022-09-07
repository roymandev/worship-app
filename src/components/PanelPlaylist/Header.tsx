import BasePanelHeader from '@/components/BasePanelHeader';
import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import { atomPlaylistPanelContent } from '@/stores/playlistStore';
import { useSetAtom } from 'jotai';
import { RiDownloadLine, RiUploadLine } from 'react-icons/ri';

const Header = () => {
  const setPanelContent = useSetAtom(atomPlaylistPanelContent);

  return (
    <BasePanelHeader>
      <h2 className="px-1">Playlist</h2>

      <ButtonPrimary
        color="gray"
        className="ml-auto h-full py-0"
        withIcon="left"
        onClick={() => setPanelContent('import')}
      >
        <RiUploadLine className="h-4 w-4" />
        Import
      </ButtonPrimary>
      <ButtonPrimary
        color="gray"
        className="h-full py-0"
        withIcon="left"
        onClick={() => setPanelContent('export')}
      >
        <RiDownloadLine className="h-4 w-4" />
        Export
      </ButtonPrimary>
    </BasePanelHeader>
  );
};

export default Header;
