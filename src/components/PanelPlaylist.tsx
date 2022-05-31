import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  liveItemAtom,
  liveItemSelectedLineIndexAtom,
} from '../stores/liveStore';
import {
  playlistItemsAtom,
  playlistNameAtom,
  playlistSelectedItemAtom,
} from '../stores/playlistStore';
import { BaseItem } from '../types/playlistTypes';
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
  const setLiveItem = useSetAtom(liveItemAtom);
  const setLiveItemSelectedLineIndex = useSetAtom(
    liveItemSelectedLineIndexAtom,
  );

  const setLiveItemHandler = (item: BaseItem) => {
    setLiveItem(item);
    setLiveItemSelectedLineIndex(item.content[0] ? 0 : -1);
  };

  return (
    <BasePanel>
      <BasePanelHeader>
        <h2 className="px-2">Playlist</h2>
      </BasePanelHeader>
      <BasePanelHeader sub>
        <BaseInput
          className="flex-1 px-1 mx-1 h-7"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
        />
      </BasePanelHeader>
      <BaseList
        className="overflow-y-auto"
        items={playlistItems}
        scrollToIndex={playlistItems.findIndex(
          (item) => item.id === playlistSelectedItem?.id,
        )}
        renderItem={(item) => (
          <BaseListLine
            className="py-1 px-2 select-none"
            key={item.id}
            isSelected={item.id === playlistSelectedItem?.id}
            onClick={() => setPlaylistSelectedAtom(item)}
            onDoubleClick={() => setLiveItemHandler(item)}
          >
            <h3 className="font-medium">{item.title}</h3>
            {item.note && <p className="text-slate-600">{item.note}</p>}
          </BaseListLine>
        )}
      />
    </BasePanel>
  );
};

export default PanelPlaylist;
