import ContentItemEditor from '@/components/PanelPlaylist/ContentItemEditor';
import ContentList from '@/components/PanelPlaylist/ContentList';
import { atomPlaylistPanelContent } from '@/stores/playlistStore';
import { useAtomValue } from 'jotai';

const PanelPlaylist = () => {
  const content = useAtomValue(atomPlaylistPanelContent);

  switch (content) {
    default:
      return <ContentList />;
    case 'addItem':
      return <ContentItemEditor newItem />;
    case 'editItem':
      return <ContentItemEditor />;
  }
};

export default PanelPlaylist;
