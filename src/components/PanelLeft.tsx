import BasePanel from '@/components/BasePanel';
import PanelPlaylist from '@/components/PanelPlaylist';
import PanelSongs from '@/components/PanelSongs';
import { useAtomValue } from 'jotai';
import { atomLeftPanelContent } from '@/stores/layoutStore';
import PanelSettings from './PanelSettings';

const PanelLeft = () => {
  const leftPanelContent = useAtomValue(atomLeftPanelContent);

  return (
    <BasePanel>
      {leftPanelContent === 'playlist' && <PanelPlaylist />}
      {leftPanelContent === 'song-database' && <PanelSongs />}
      {leftPanelContent === 'settings' && <PanelSettings />}
    </BasePanel>
  );
};

export default PanelLeft;
