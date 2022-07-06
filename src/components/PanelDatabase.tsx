import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { RiPlayListAddFill } from 'react-icons/ri';
import { useDebounce } from '../hooks/useDebounce';
import { listController } from '../lib/listController';
import {
  atomContextMenuActive,
  atomContextMenuPos,
} from '../stores/contextMenuStore';
import {
  atomDatabaseItems,
  atomDatabaseParsedSelectedItem,
  atomDatabaseSelectedItemIndex,
} from '../stores/databaseStore';
import { atomPlaylistAddItem } from '../stores/playlistStore';
import {
  atomPreviewItem,
  atomPreviewItemContentSelectedLineIndex,
} from '../stores/previewStore';
import BaseInput from './BaseInput';
import BaseList from './BaseList';
import BaseListLine from './BaseListLine';
import BasePanel from './BasePanel';
import BasePanelHeader from './BasePanelHeader';
import ButtonDefault from './Buttons/ButtonDefault';

const PanelDatabase = () => {
  const [items, setItems] = useAtom(atomDatabaseItems);
  const [selectedItemIndex, setSelectedItemIndex] = useAtom(
    atomDatabaseSelectedItemIndex,
  );
  const parsedSelectedItem = useAtomValue(atomDatabaseParsedSelectedItem);
  const itemsHandler = listController({
    items,
    selectedItemIndex,
    setSelectedItemIndex,
  });

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const searchQueryDebounced = useDebounce(searchQuery, 500);
  useEffect(() => {
    const result = items.filter(
      (item) =>
        item.title
          .toLocaleLowerCase()
          .search(searchQueryDebounced.toLocaleLowerCase()) !== -1 && item,
    );
    setItems(result);
    if (searchQueryDebounced && result[0]) setSelectedItemIndex(0);
  }, [searchQueryDebounced]);

  // Add Playlist Item
  const setPlaylistAddItem = useSetAtom(atomPlaylistAddItem);
  const addPlaylistItemHandler = () => {
    const parsedItem = parsedSelectedItem;
    parsedItem && setPlaylistAddItem(parsedItem);
  };

  // Show Item Preview
  const setPreviewItem = useSetAtom(atomPreviewItem);
  const setPreviewContentSelectedLineIndex = useSetAtom(
    atomPreviewItemContentSelectedLineIndex,
  );
  const showPreviewHandler = () => {
    const parsedItem = parsedSelectedItem;
    if (parsedItem) {
      setPreviewItem(parsedItem);
      setPreviewContentSelectedLineIndex(parsedItem.content[0] ? 0 : -1);
    }
  };
  useEffect(showPreviewHandler, [selectedItemIndex]);

  // Context Menu
  const setContextMenuActive = useSetAtom(atomContextMenuActive);
  const setContextMenuPos = useSetAtom(atomContextMenuPos);

  return (
    <BasePanel>
      <BasePanelHeader>
        <h2 className="px-2">Database</h2>
      </BasePanelHeader>

      <BasePanelHeader sub className="p-1 gap-1">
        <BaseInput
          className="flex-1 px-1 h-7"
          placeholder="Search song title"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </BasePanelHeader>

      <div className="flex flex-1 divide-x divide-slate-300">
        <BaseList
          className="flex-1"
          scrollToIndex={selectedItemIndex}
          onKeyDownArrowUp={itemsHandler.shiftSelectedItemUp}
          onKeyDownArrowDown={itemsHandler.shiftSelectedItemDown}
          onFocus={showPreviewHandler}
          tabIndex={items.length ? 0 : -1}
        >
          {items.map((item, index) => (
            <BaseListLine
              className="py-1 px-2 select-none"
              key={item.id}
              isSelected={item.id === parsedSelectedItem?.id}
              onClick={() => setSelectedItemIndex(index)}
              onContextMenu={(e) => {
                e.preventDefault();
                setSelectedItemIndex(index);
                setContextMenuPos({
                  left: e.clientX,
                  top: e.clientY,
                });
                setContextMenuActive('databaseItem');
              }}
            >
              {item.title}
            </BaseListLine>
          ))}
        </BaseList>

        <div className="flex flex-col gap-1 p-1">
          <ButtonDefault
            tabIndex={-1}
            color="blue"
            className="p-1.5"
            onClick={addPlaylistItemHandler}
          >
            <RiPlayListAddFill className="w-4 h-4" />
          </ButtonDefault>
        </div>
      </div>
    </BasePanel>
  );
};

export default PanelDatabase;
