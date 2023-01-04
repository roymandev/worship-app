import BasePanel from '@/components/BasePanel';
import List from '@/components/PanelPlaylist/List';
import Header from '@/components/PanelPlaylist/Header';

const PanelPlaylist = () => {
  return (
    <BasePanel>
      <Header />
      <List />
    </BasePanel>
  );
};

export default PanelPlaylist;
