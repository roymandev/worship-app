import BasePanel from '@/components/BasePanel';
import ContentList from '@/components/PanelPlaylist/ContentList';
import Header from '@/components/PanelPlaylist/Header';

const PanelPlaylist = () => {
  return (
    <BasePanel>
      <Header />
      <ContentList />
    </BasePanel>
  );
};

export default PanelPlaylist;
