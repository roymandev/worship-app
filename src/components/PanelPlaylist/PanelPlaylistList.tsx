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
  const [name, setPlaylistName] = useAtom(atomPlaylistName);
  const [items, setItems] = useAtom(atomPlaylistItems);
  const selectedItem = useAtomValue(atomPlaylistSelectedItem);
  const [selectedItemIndex, setSelectedItemIndex] = useAtom(
    atomPlaylistSelectedItemIndex,
  );
  const itemsHandler = listController({
    items,
    selectedItemIndex,
    setItems,
    setSelectedItemIndex,
  });

  // Select first item on mounted
  useEffect(() => {
    if (items[0] && selectedItemIndex === -1) setSelectedItemIndex(0);
  }, []);

  // Show Item Preview
  const setPreviewItem = useSetAtom(atomPreviewItem);
  const setPreviewContentSelectedLineIndex = useSetAtom(
    atomPreviewItemContentSelectedLineIndex,
  );
  const showPreviewHandler = () => {
    setPreviewItem(selectedItem);
    setPreviewContentSelectedLineIndex(selectedItem?.content[0] ? 0 : -1);
  };
  useEffect(showPreviewHandler, [selectedItem]);

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
          value={name}
          onChange={(e) => setPlaylistName(e.target.value)}
        />
      </BasePanelHeader>

      <div className="flex flex-1 divide-x divide-slate-300">
        <BaseList
          className="overflow-y-auto flex-1"
          scrollToIndex={selectedItemIndex}
          onKeyDownArrowUp={itemsHandler.shiftSelectedItemUp}
          onKeyDownArrowDown={itemsHandler.shiftSelectedItemDown}
          onKeyDownEnter={() => setLiveItemHandler(selectedItem)}
          onFocus={showPreviewHandler}
          tabIndex={items.length ? 0 : -1}
        >
          {items.map((item, index) => (
            <BaseListLine
              className="py-1 px-2 select-none"
              key={item.id}
              isSelected={index === selectedItemIndex}
              onClick={() => setSelectedItemIndex(index)}
              onDoubleClick={() => setLiveItemHandler(item)}
              onContextMenu={(e) => {
                e.preventDefault();
                setSelectedItemIndex(index);
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

        <PanelPlaylistListController listHandler={itemsHandler} />
      </div>
    </>
  );
};

export default PanelPlaylistList;
