import BasePanel from '@/components/BasePanel';
import ContentExport from '@/components/PanelPlaylist/ContentExport';
import ContentImport from '@/components/PanelPlaylist/ContentImport';
import Header from '@/components/PanelPlaylist/Header';
import { atomPlaylistPanelContent } from '@/stores/playlistStore';
import { useAtomValue } from 'jotai';

const PanelPlaylist = () => {
  const panelContent = useAtomValue(atomPlaylistPanelContent);

  return (
    <BasePanel>
      <Header />
      {panelContent === 'export' && <ContentExport />}
      {panelContent === 'import' && <ContentImport />}
    </BasePanel>
  );
};

export default PanelPlaylist;
