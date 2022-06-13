import { RiDownloadLine, RiUploadLine } from 'react-icons/ri';
import BasePanelHeader from '../BasePanelHeader';
import BaseButton from '../BaseButton';
import { atomPlaylistPanelContent } from '../../stores/playlistStore';
import { useSetAtom } from 'jotai';

const PanelPlaylistHeader = ({}) => {
  const setPlaylistPanelContent = useSetAtom(atomPlaylistPanelContent);

  return (
    <BasePanelHeader>
      <h2 className="px-2">Playlist</h2>

      <BaseButton
        variant="default"
        className={'flex gap-1 items-center pr-3 pl-2 mr-1 ml-auto h-7'}
        onClick={() => setPlaylistPanelContent('import')}
      >
        <RiUploadLine className="w-4 h-4" />
        Import
      </BaseButton>

      <BaseButton
        variant="default"
        className="flex gap-1 items-center pr-3 pl-2 mr-1 h-7"
        onClick={() => setPlaylistPanelContent('export')}
      >
        <RiDownloadLine className="w-4 h-4" />
        Export
      </BaseButton>
    </BasePanelHeader>
  );
};

export default PanelPlaylistHeader;
