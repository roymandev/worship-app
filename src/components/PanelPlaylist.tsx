import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  playlistItemsAtom,
  playlistNameAtom,
  playlistSelectedItemAtom,
  playlistSelectedItemIndexAtom,
  playlistShiftSelectedItemDownAtom,
  playlistShiftSelectedItemUpAtom,
} from '../stores/playlistStore';
import {
  liveItemAtom,
  liveItemSelectedLineIndexAtom,
} from '../stores/liveStore';
import { BaseItem, PlaylistItem } from '../types/playlistTypes';
import BaseInput from './BaseInput';
import BaseList from './BaseList';
import BaseListLine from './BaseListLine';
import BasePanel from './BasePanel';
import BasePanelHeader from './BasePanelHeader';

const PanelPlaylist = () => {
  const [playlistName, setPlaylistName] = useAtom(playlistNameAtom);
  const playlistItems = useAtomValue(playlistItemsAtom);
  const [playlistSelectedItemIndex, setPlaylistSelectedItemIndex] = useAtom(
    playlistSelectedItemIndexAtom,
  );
  const playlistSelectedItem = useAtomValue(playlistSelectedItemAtom);

  // liveStore
  const setLiveItem = useSetAtom(liveItemAtom);
  const setLiveItemSelectedLineIndex = useSetAtom(
    liveItemSelectedLineIndexAtom,
  );
  const setLiveItemHandler = (item: BaseItem | null) => {
    setLiveItem(item);
    setLiveItemSelectedLineIndex(item?.content[0] ? 0 : -1);
  };

  // playlistStore actions
  const playlistShiftSelectedItemUp = useSetAtom(
    playlistShiftSelectedItemUpAtom,
  );
  const playlistShiftSelectedItemDown = useSetAtom(
    playlistShiftSelectedItemDownAtom,
  );

  // Render playlist item
  const renderPlaylistItem = (item: PlaylistItem, index: number) => (
    <BaseListLine
      className="py-1 px-2 select-none"
      key={item.id}
      isSelected={index === playlistSelectedItemIndex}
      onClick={() => setPlaylistSelectedItemIndex(index)}
      onDoubleClick={() => setLiveItemHandler(item)}
    >
      <h3 className="font-medium">{item.title}</h3>
      {item.note && <p className="text-slate-600">{item.note}</p>}
    </BaseListLine>
  );

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
        scrollToIndex={playlistSelectedItemIndex}
        onKeyDownArrowUp={playlistShiftSelectedItemUp}
        onKeyDownArrowDown={playlistShiftSelectedItemDown}
        onKeyDownEnter={() => setLiveItemHandler(playlistSelectedItem)}
        renderItem={renderPlaylistItem}
      />
    </BasePanel>
  );
};

export default PanelPlaylist;
