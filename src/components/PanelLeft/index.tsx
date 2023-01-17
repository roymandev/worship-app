import BasePanel from '@/components/BasePanel';
import PanelPlaylist from '@/components/PanelPlaylist';
import Header from '@/components/PanelLeft/Header';
import { useState } from 'react';

export type Tabs = 'playlist';

const PanelLeft = () => {
  const [tab, setTab] = useState<Tabs>('playlist');

  return (
    <BasePanel>
      <Header tab={tab} setTab={setTab} />

      {tab === 'playlist' && <PanelPlaylist />}
    </BasePanel>
  );
};

export default PanelLeft;
