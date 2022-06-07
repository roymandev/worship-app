import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  RiAddLine,
  RiArrowDownLine,
  RiArrowUpLine,
  RiDeleteBin2Line,
  RiPencilLine,
} from 'react-icons/ri';
import {
  atomPlaylistItems,
  atomPlaylistName,
  atomPlaylistSelectedItem,
  atomPlaylistSelectedItemIndex,
} from '../stores/playlistStore';
import {
  atomLiveItem,
  atomLiveItemContentSelectedLineIndex,
} from '../stores/liveStore';
import { BaseItem, PlaylistItem } from '../types/playlistTypes';
import BaseInput from './BaseInput';
import BaseList from './BaseList';
import BaseListLine from './BaseListLine';
import BasePanelHeader from './BasePanelHeader';
import BaseButton from './BaseButton';
import { listController } from '../lib/listController';
import { PanelPlaylistBody } from './PanelPlaylist';

interface PanelPlaylistListProps {
  setPanelBody: (panelName: PanelPlaylistBody) => void;
}

const PanelPlaylistList = ({ setPanelBody }: PanelPlaylistListProps) => {
  const [playlistName, setPlaylistName] = useAtom(atomPlaylistName);
  const [playlistItems, setPlaylistItems] = useAtom(atomPlaylistItems);
  const playlistSelectedItem = useAtomValue(atomPlaylistSelectedItem);
  const [playlistSelectedItemIndex, setPlaylistSelectedItemIndex] = useAtom(
    atomPlaylistSelectedItemIndex,
  );

  const listHandler = listController({
    items: playlistItems,
    selectedItemIndex: playlistSelectedItemIndex,
    setItems: (items) => setPlaylistItems(items),
    setSelectedItemIndex: (index) => setPlaylistSelectedItemIndex(index),
  });

  // liveStore
  const setLiveItem = useSetAtom(atomLiveItem);
  const setLiveItemSelectedLineIndex = useSetAtom(
    atomLiveItemContentSelectedLineIndex,
  );
  const setLiveItemHandler = (item: BaseItem | null) => {
    setLiveItem(item);
    setLiveItemSelectedLineIndex(item?.content[0] ? 0 : -1);
  };

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
    <>
      <BasePanelHeader sub>
        <BaseInput
          className="flex-1 px-1 mx-1 h-7"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
        />
      </BasePanelHeader>

      <div className="flex flex-1 divide-x divide-slate-300">
        <BaseList
          className="overflow-y-auto flex-1"
          items={playlistItems}
          scrollToIndex={playlistSelectedItemIndex}
          onKeyDownArrowUp={listHandler.shiftSelectedItemUp}
          onKeyDownArrowDown={listHandler.shiftSelectedItemDown}
          onKeyDownEnter={() => setLiveItemHandler(playlistSelectedItem)}
          renderItem={renderPlaylistItem}
        />

        <div className="flex flex-col gap-1 p-1">
          <BaseButton
            variant="default"
            className="p-1.5"
            onClick={() => setPanelBody('addItem')}
          >
            <RiAddLine className="w-4 h-4" />
          </BaseButton>
          <hr />
          <BaseButton
            variant="default"
            className="p-1.5"
            onClick={listHandler.moveSelectedItemUp}
            disabled={!listHandler.canShiftSelectedItemUp()}
          >
            <RiArrowUpLine className="w-4 h-4" />
          </BaseButton>
          <BaseButton
            variant="default"
            className="p-1.5"
            onClick={listHandler.moveSelectedItemDown}
            disabled={!listHandler.canShiftSelectedItemDown()}
          >
            <RiArrowDownLine className="w-4 h-4" />
          </BaseButton>
          <hr />
          <BaseButton
            variant="default"
            className="p-1.5"
            onClick={() => setPanelBody('itemEditor')}
            disabled={!listHandler.selectedItem()}
          >
            <RiPencilLine className="w-4 h-4" />
          </BaseButton>
          <BaseButton
            variant="default"
            className="p-1.5"
            onClick={listHandler.removeSelectedItem}
            disabled={!listHandler.selectedItem()}
          >
            <RiDeleteBin2Line className="w-4 h-4" />
          </BaseButton>
        </div>
      </div>
    </>
  );
};

export default PanelPlaylistList;
