import { RiCloseFill, RiDownloadLine, RiUploadLine } from 'react-icons/ri';
import BasePanelHeader from './BasePanelHeader';
import { twMerge } from 'tailwind-merge';
import BaseButton from './BaseButton';
import type { PanelPlaylistBody } from './PanelPlaylist';
import { useAtomCallback } from 'jotai/utils';
import { useCallback } from 'react';
import { atomPlaylistItems, atomPlaylistName } from '../stores/playlistStore';
import { downloadObject } from '../lib/downloadObject';

interface PanelPlaylistHeaderProps {
  panelBody: PanelPlaylistBody;
  setPanelBody: (panelName: PanelPlaylistBody) => void;
}

const PanelPlaylistHeader = ({
  panelBody,
  setPanelBody,
}: PanelPlaylistHeaderProps) => {
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
        className={twMerge(
          'flex gap-1 items-center pr-3 pl-2 mr-1 ml-auto h-7',
          panelBody === 'import' && 'border-slate-400 bg-slate-300',
        )}
        onClick={() => setPanelBody(panelBody === 'import' ? 'list' : 'import')}
      >
        {panelBody === 'import' ? (
          <RiCloseFill className="w-4 h-4" />
        ) : (
          <RiUploadLine className="w-4 h-4" />
        )}
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
