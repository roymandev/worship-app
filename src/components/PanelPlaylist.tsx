import BasePanel from './BasePanel';
import { useState } from 'react';
import PanelPlaylistList from './PanelPlaylistList';
import PanelPlaylistImport from './PanelPlaylistImport';
import PanelPlaylistHeader from './PanelPlaylistHeader';

export type PanelPlaylistBody = 'list' | 'import' | 'export';

const PanelPlaylist = () => {
  const [panelBody, setPanelBody] = useState<PanelPlaylistBody>('list');

  return (
    <BasePanel>
      <PanelPlaylistHeader panelBody={panelBody} setPanelBody={setPanelBody} />
      {panelBody === 'list' && <PanelPlaylistList />}
      {panelBody === 'import' && (
        <PanelPlaylistImport close={() => setPanelBody('list')} />
      )}
    </BasePanel>
  );
};

export default PanelPlaylist;
