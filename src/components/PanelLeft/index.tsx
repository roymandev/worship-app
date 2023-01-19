import BasePanel from '@/components/BasePanel';
import PanelPlaylist from '@/components/PanelPlaylist';
import Header from '@/components/PanelLeft/Header';
import { useState } from 'react';
import PanelSearch from '@/components/PanelSearch';

export type Tabs = 'playlist' | 'search';

const PanelLeft = () => {
  const [tab, setTab] = useState<Tabs>('playlist');

  return (
    <BasePanel>
      <Header tab={tab} setTab={setTab} />

      {tab === 'playlist' && <PanelPlaylist />}
      {tab === 'search' && <PanelSearch />}
    </BasePanel>
  );
};

export default PanelLeft;
