import BasePanel from '@/components/BasePanel';
import PanelPlaylist from '@/components/PanelPlaylist';
import Header from '@/components/PanelLeft/Header';
import { useState } from 'react';
import PanelSongs from '@/components/PanelSongs';

export type Tabs = 'playlist' | 'songs';

const PanelLeft = () => {
  const [tab, setTab] = useState<Tabs>('playlist');

  return (
    <BasePanel>
      <Header tab={tab} setTab={setTab} />

      {tab === 'playlist' && <PanelPlaylist />}
      {tab === 'songs' && <PanelSongs />}
    </BasePanel>
  );
};

export default PanelLeft;
