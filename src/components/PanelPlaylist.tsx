import { useAtom, useAtomValue } from 'jotai';
import {
  playlistItemsAtom,
  playlistNameAtom,
  playlistSelectedItemAtom,
} from '../stores/playlistStore';
import BaseInput from './BaseInput';
import BaseList from './BaseList';
import BaseListLine from './BaseListLine';
import BasePanel from './BasePanel';
import BasePanelHeader from './BasePanelHeader';

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
          <BaseListLine
            className="py-1 px-2"
            key={item.id}
            isSelected={item.id === playlistSelectedItem?.id}
            onClick={() => setPlaylistSelectedAtom(item)}
          >
            {item.title}
          </BaseListLine>
        )}
      />
    </BasePanel>
  );
};

export default PanelPlaylist;
