import BasePanel from '@/components/BasePanel';
import ContentList from '@/components/PanelPlaylist/ContentList';
import Header from '@/components/PanelPlaylist/Header';
import { useState } from 'react';

const PanelPlaylist = () => {
  const [content] = useState<'list'>('list');

  return (
    <BasePanel>
      <Header />

      {content === 'list' && <ContentList />}
    </BasePanel>
  );
};

export default PanelPlaylist;
