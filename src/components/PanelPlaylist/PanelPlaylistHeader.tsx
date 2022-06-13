import { RiDownloadLine, RiUploadLine } from 'react-icons/ri';
import BasePanelHeader from '../BasePanelHeader';
import BaseButton from '../BaseButton';
import { useAtomCallback } from 'jotai/utils';
import { useCallback } from 'react';
import {
  atomPlaylistItems,
  atomPlaylistName,
  atomPlaylistPanelContent,
} from '../../stores/playlistStore';
import { downloadObject } from '../../lib/downloadObject';
import { useSetAtom } from 'jotai';

const PanelPlaylistHeader = ({}) => {
  const setPlaylistPanelContent = useSetAtom(atomPlaylistPanelContent);

  const playlistExportHandler = useAtomCallback(
    useCallback((get) => {
      const playlistName = get(atomPlaylistName) || 'Untitled';
      const playlistItems = get(atomPlaylistItems);

      downloadObject(
        { name: playlistName, items: playlistItems },
        playlistName + '.WORSHIP',
      );
    }, []),
  );

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
        onClick={playlistExportHandler}
      >
        <RiDownloadLine className="w-4 h-4" />
        Export
      </BaseButton>
    </BasePanelHeader>
  );
};

export default PanelPlaylistHeader;
