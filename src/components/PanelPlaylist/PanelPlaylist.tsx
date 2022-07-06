import BasePanel from '../BasePanel';
import PanelPlaylistList from './PanelPlaylistList';
import PanelPlaylistImport from './PanelPlaylistImport';
import PanelPlaylistHeader from './PanelPlaylistHeader';
import PanelPlaylistItemEditor from './PanelPlaylistItemEditor';
import { useAtomValue } from 'jotai';
import { atomPlaylistPanelContent } from '../../stores/playlistStore';
import PanelPlaylistExport from './PanelPlaylistExport';

const PanelPlaylist = () => {
  const panelContent = useAtomValue(atomPlaylistPanelContent);
  return (
    <BasePanel>
      <PanelPlaylistHeader />
      {panelContent === 'list' && <PanelPlaylistList />}
      {panelContent === 'import' && <PanelPlaylistImport />}
      {panelContent === 'export' && <PanelPlaylistExport />}
      {panelContent === 'itemEditor' && <PanelPlaylistItemEditor />}
      {panelContent === 'addItem' && <PanelPlaylistItemEditor addItem />}
    </BasePanel>
  );
};

export default PanelPlaylist;
