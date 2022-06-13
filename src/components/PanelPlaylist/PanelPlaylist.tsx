import BasePanel from '../BasePanel';
import PanelPlaylistList from './PanelPlaylistList';
import PanelPlaylistImport from './PanelPlaylistImport';
import PanelPlaylistHeader from './PanelPlaylistHeader';
import PanelPlaylistItemEditor from './PanelPlaylistItemEditor';
import { useAtomValue } from 'jotai';
import { atomPlaylistPanelContent } from '../../stores/playlistStore';

const PanelPlaylist = () => {
  const playlistPanelContent = useAtomValue(atomPlaylistPanelContent);
  return (
    <BasePanel>
      <PanelPlaylistHeader />
      {playlistPanelContent === 'list' && <PanelPlaylistList />}
      {playlistPanelContent === 'import' && <PanelPlaylistImport />}
      {playlistPanelContent === 'itemEditor' && <PanelPlaylistItemEditor />}
      {playlistPanelContent === 'addItem' && (
        <PanelPlaylistItemEditor addItem />
      )}
    </BasePanel>
  );
};

export default PanelPlaylist;
