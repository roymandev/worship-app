import { useAtom, useAtomValue } from 'jotai';
import {
  playlistItemsAtom,
  playlistNameAtom,
  playlistSelectedItemAtom,
} from '../stores/playlistStore';
import BaseInput from './BaseInput';
import BaseList from './BaseList';
import BasePanel from './BasePanel';
import BasePanelHeader from './BasePanelHeader';
import PanelPlaylistItem from './PanelPlaylistItem';

const PanelPlaylist = () => {
  const [playlistName, setPlaylistName] = useAtom(playlistNameAtom);
  const playlistItems = useAtomValue(playlistItemsAtom);
  const [playlistSelectedItem, setPlaylistSelectedAtom] = useAtom(
    playlistSelectedItemAtom,
  );

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
      <BaseList
        className="overflow-y-auto"
        items={playlistItems}
        selectedItemIndex={playlistItems.findIndex(
          (item) => item.id === playlistSelectedItem?.id,
        )}
        renderItem={(item) => (
          <PanelPlaylistItem
            key={item.id}
            item={item}
            isSelected={item.id === playlistSelectedItem?.id}
            onClick={() => setPlaylistSelectedAtom(item)}
          />
        )}
      />
    </BasePanel>
  );
};

export default PanelPlaylist;
