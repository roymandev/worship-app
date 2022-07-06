import { RiDownloadLine, RiUploadLine } from 'react-icons/ri';
import BasePanelHeader from '../BasePanelHeader';
import { atomPlaylistPanelContent } from '../../stores/playlistStore';
import { useSetAtom } from 'jotai';
import ButtonDefault from '../Buttons/ButtonDefault';

const PanelPlaylistHeader = ({}) => {
  const setPanelContent = useSetAtom(atomPlaylistPanelContent);

  return (
    <BasePanelHeader>
      <h2 className="px-2">Playlist</h2>

      <ButtonDefault
        color="gray"
        withIcon="left"
        className="ml-auto h-7"
        onClick={() => setPanelContent('import')}
      >
        <RiUploadLine className="w-4 h-4" />
        Import
      </ButtonDefault>

      <ButtonDefault
        color="gray"
        withIcon="left"
        className="mx-1 h-7"
        onClick={() => setPanelContent('export')}
      >
        <RiDownloadLine className="w-4 h-4" />
        Export
      </ButtonDefault>
    </BasePanelHeader>
  );
};

export default PanelPlaylistHeader;
