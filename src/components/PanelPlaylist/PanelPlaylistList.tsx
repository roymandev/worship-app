import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  atomPlaylistItems,
  atomPlaylistName,
  atomPlaylistSelectedItem,
  atomPlaylistSelectedItemIndex,
} from '../../stores/playlistStore';
import {
  atomLiveItem,
  atomLiveItemContentSelectedLineIndex,
} from '../../stores/liveStore';
import { BaseItem } from '../../types/itemTypes';
import BaseInput from '../BaseInput';
import BaseList from '../BaseList';
import BaseListLine from '../BaseListLine';
import BasePanelHeader from '../BasePanelHeader';
import { listController } from '../../lib/listController';
import {
  atomContextMenuActive,
  atomContextMenuPos,
} from '../../stores/contextMenuStore';
import { useEffect } from 'react';
import {
  atomPreviewItem,
  atomPreviewItemContentSelectedLineIndex,
} from '../../stores/previewStore';
import PanelPlaylistListController from './PanelPlaylistListController';

const PanelPlaylistList = () => {
  const setContextMenuActive = useSetAtom(atomContextMenuActive);
  const setContextMenuPos = useSetAtom(atomContextMenuPos);
  const [playlistName, setPlaylistName] = useAtom(atomPlaylistName);
  const [playlistItems, setPlaylistItems] = useAtom(atomPlaylistItems);
  const playlistSelectedItem = useAtomValue(atomPlaylistSelectedItem);
  const [playlistSelectedItemIndex, setPlaylistSelectedItemIndex] = useAtom(
    atomPlaylistSelectedItemIndex,
  );

  // Select first item on mounted
  useEffect(() => {
    playlistItems[0] && setPlaylistSelectedItemIndex(0);
  }, []);

  // Show Item Preview
  const setPreviewItem = useSetAtom(atomPreviewItem);
  const setPreviewContentSelectedLineIndex = useSetAtom(
    atomPreviewItemContentSelectedLineIndex,
  );
  const showPreviewHandler = () => {
    setPreviewItem(playlistSelectedItem);
    setPreviewContentSelectedLineIndex(
      playlistSelectedItem?.content[0] ? 0 : -1,
    );
  };
  useEffect(showPreviewHandler, [playlistSelectedItem]);

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
          scrollToIndex={playlistSelectedItemIndex}
          onKeyDownArrowUp={listHandler.shiftSelectedItemUp}
          onKeyDownArrowDown={listHandler.shiftSelectedItemDown}
          onKeyDownEnter={() => setLiveItemHandler(playlistSelectedItem)}
          onFocus={showPreviewHandler}
        >
          {playlistItems.map((item, index) => (
            <BaseListLine
              className="py-1 px-2 select-none"
              key={item.id}
              isSelected={index === playlistSelectedItemIndex}
              onClick={() => setPlaylistSelectedItemIndex(index)}
              onDoubleClick={() => setLiveItemHandler(item)}
              onContextMenu={(e) => {
                e.preventDefault();
                setPlaylistSelectedItemIndex(index);
                setContextMenuPos({
                  left: e.clientX,
                  top: e.clientY,
                });
                setContextMenuActive('playlistItem');
              }}
            >
              <h3 className="font-medium">{item.title}</h3>
              {item.note && <p className="text-slate-600">{item.note}</p>}
            </BaseListLine>
          ))}
        </BaseList>

        <PanelPlaylistListController listHandler={listHandler} />
      </div>
    </>
  );
};

export default PanelPlaylistList;
