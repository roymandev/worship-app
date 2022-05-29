import { useAtomValue } from 'jotai';
import { playlistNameAtom } from '../stores/playlistStore';
import BasePanel from './BasePanel';
import BasePanelHeader from './BasePanelHeader';

const PanelPlaylist = () => {
  const playlistName = useAtomValue(playlistNameAtom);

  return (
    <BasePanel>
      <BasePanelHeader>
        <h2 className="px-2">Playlist</h2>
      </BasePanelHeader>
      <BasePanelHeader sub>
        <h3 className="px-2">{playlistName}</h3>
      </BasePanelHeader>
    </BasePanel>
  );
};

export default PanelPlaylist;
