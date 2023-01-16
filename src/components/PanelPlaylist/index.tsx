import BasePanel from '@/components/BasePanel';
import BasePanelHeader from '@/components/BasePanelHeader';
import ContentItemEditor from '@/components/PanelPlaylist/ContentItemEditor';
import ContentList from '@/components/PanelPlaylist/ContentList';
import { atomPlaylistPanelContent } from '@/stores/playlistStore';
import { useAtomValue } from 'jotai';

const PanelPlaylist = () => {
  const content = useAtomValue(atomPlaylistPanelContent);

  return (
    <BasePanel>
      <BasePanelHeader>
        <h2 className="px-1">Playlist</h2>
      </BasePanelHeader>

      {content === 'list' && <ContentList />}
      {content === 'addItem' && <ContentItemEditor newItem />}
      {content === 'editItem' && <ContentItemEditor />}
    </BasePanel>
  );
};

export default PanelPlaylist;
