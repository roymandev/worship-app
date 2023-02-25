import BasePanel from '@/components/BasePanel';
import PanelPlaylist from '@/components/PanelPlaylist';
import PanelSongs from '@/components/PanelSongs';
import { useAtomValue } from 'jotai';
import { atomLeftPanelContent } from '@/stores/layoutStore';

const PanelLeft = () => {
  const leftPanelContent = useAtomValue(atomLeftPanelContent);

  return (
    <BasePanel>
      {leftPanelContent === 'playlist' && <PanelPlaylist />}
      {leftPanelContent === 'song-database' && <PanelSongs />}
    </BasePanel>
  );
};

export default PanelLeft;
