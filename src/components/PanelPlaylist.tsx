import BasePanel from './BasePanel';
import { useState } from 'react';
import PanelPlaylistList from './PanelPlaylistList';
import PanelPlaylistImport from './PanelPlaylistImport';
import PanelPlaylistHeader from './PanelPlaylistHeader';
import PanelPlaylistItemEditor from './PanelPlaylistItemEditor';

export type PanelPlaylistBody = 'list' | 'import' | 'itemEditor';

const PanelPlaylist = () => {
  const [panelBody, setPanelBody] = useState<PanelPlaylistBody>('list');

  return (
    <BasePanel>
      <PanelPlaylistHeader panelBody={panelBody} setPanelBody={setPanelBody} />
      {panelBody === 'list' && (
        <PanelPlaylistList setPanelBody={setPanelBody} />
      )}
      {panelBody === 'import' && (
        <PanelPlaylistImport close={() => setPanelBody('list')} />
      )}
      {panelBody === 'itemEditor' && (
        <PanelPlaylistItemEditor setPanelBody={setPanelBody} />
      )}
    </BasePanel>
  );
};

export default PanelPlaylist;
