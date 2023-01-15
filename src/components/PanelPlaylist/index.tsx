import BasePanel from '@/components/BasePanel';
import ContentItemEditor from '@/components/PanelPlaylist/ContentItemEditor';
import ContentList from '@/components/PanelPlaylist/ContentList';
import Header from '@/components/PanelPlaylist/Header';
import { atomPlaylistPanelContent } from '@/stores/playlistStore';
import { useAtomValue } from 'jotai';

const PanelPlaylist = () => {
  const content = useAtomValue(atomPlaylistPanelContent);

  return (
    <BasePanel>
      <Header />

      {content === 'list' && <ContentList />}
      {content === 'addItem' && <ContentItemEditor newItem />}
      {content === 'editItem' && <ContentItemEditor />}
    </BasePanel>
  );
};

export default PanelPlaylist;
