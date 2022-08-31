import BasePanel from '@/components/BasePanel';
import ContentExport from '@/components/PanelPlaylist/ContentExport';
import ContentImport from '@/components/PanelPlaylist/ContentImport';
import ContentItemEditor from '@/components/PanelPlaylist/ContentItemEditor';
import ContentList from '@/components/PanelPlaylist/ContentList';
import Header from '@/components/PanelPlaylist/Header';
import { atomPlaylistPanelContent } from '@/stores/playlistStore';
import { useAtomValue } from 'jotai';

const PanelPlaylist = () => {
  const panelContent = useAtomValue(atomPlaylistPanelContent);

  return (
    <BasePanel>
      <Header />
      {panelContent === 'list' && <ContentList />}
      {panelContent === 'export' && <ContentExport />}
      {panelContent === 'import' && <ContentImport />}
      {panelContent === 'addItem' && <ContentItemEditor addItem />}
      {panelContent === 'editItem' && <ContentItemEditor />}
    </BasePanel>
  );
};

export default PanelPlaylist;
