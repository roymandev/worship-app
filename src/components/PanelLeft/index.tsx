import BasePanel from '@/components/BasePanel';
import PanelPlaylist from '@/components/PanelPlaylist';
import { useState } from 'react';
import PanelSongs from '@/components/PanelSongs';
import { Title } from '@mantine/core';
import BasePanelHeader from '../BasePanelHeader';
import { IconListCheck } from '@tabler/icons-react';

export type Tabs = 'playlist' | 'songs';

const PanelLeft = () => {
  const [tab] = useState<Tabs>('playlist');

  return (
    <BasePanel>
      <BasePanelHeader>
        <IconListCheck size={18} />
        <Title size="h6" weight="normal">
          Playlist
        </Title>
      </BasePanelHeader>

      {tab === 'playlist' && <PanelPlaylist />}
      {tab === 'songs' && <PanelSongs />}
    </BasePanel>
  );
};

export default PanelLeft;
