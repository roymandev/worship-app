import { useAtom } from 'jotai';
import { playlistNameAtom } from '../stores/playlistStore';
import BaseInput from './BaseInput';
import BasePanel from './BasePanel';
import BasePanelHeader from './BasePanelHeader';

const PanelPlaylist = () => {
  const [playlistName, setPlaylistName] = useAtom(playlistNameAtom);

  return (
    <BasePanel>
      <BasePanelHeader>
        <h2 className="px-2">Playlist</h2>
      </BasePanelHeader>
      <BasePanelHeader sub>
        <BaseInput
          className="flex-1 px-1 mx-1 h-6"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
        />
      </BasePanelHeader>
    </BasePanel>
  );
};

export default PanelPlaylist;
