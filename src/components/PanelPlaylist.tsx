import { RiCloseFill, RiUploadLine } from 'react-icons/ri';

import BasePanel from './BasePanel';
import BasePanelHeader from './BasePanelHeader';
import BaseButton from './BaseButton';
import { useState } from 'react';
import PanelPlaylistList from './PanelPlaylistList';
import PanelPlaylistImport from './PanelPlaylistImport';
import { twMerge } from 'tailwind-merge';

const PanelPlaylist = () => {
  const [panelBody, setPanelBody] = useState<'list' | 'import'>('list');

  return (
    <BasePanel>
      <BasePanelHeader>
        <h2 className="px-2">Playlist</h2>
        <BaseButton
          variant="default"
          className={twMerge(
            'flex gap-1 items-center pr-3 pl-2 mx-1 ml-auto h-7',
            panelBody === 'import' && 'border-slate-400 bg-slate-300',
          )}
          onClick={() =>
            setPanelBody(panelBody === 'import' ? 'list' : 'import')
          }
        >
          {panelBody === 'import' ? (
            <RiCloseFill className="w-4 h-4" />
          ) : (
            <RiUploadLine className="w-4 h-4" />
          )}
          Import
        </BaseButton>
      </BasePanelHeader>
      {panelBody === 'list' && <PanelPlaylistList />}
      {panelBody === 'import' && (
        <PanelPlaylistImport close={() => setPanelBody('list')} />
      )}
    </BasePanel>
  );
};

export default PanelPlaylist;
