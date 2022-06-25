import { useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { RiPlayListAddFill } from 'react-icons/ri';
import { listController } from '../lib/listController';
import { atomPlaylistAddItem } from '../stores/playlistStore';
import {
  atomPreviewItem,
  atomPreviewItemContentSelectedLineIndex,
} from '../stores/previewStore';
import { DatabaseItem } from '../types/itemTypes';
import BaseList from './BaseList';
import BaseListLine from './BaseListLine';
import BasePanel from './BasePanel';
import BasePanelHeader from './BasePanelHeader';
import ButtonDefault from './Buttons/ButtonDefault';

const dummyLyrics: DatabaseItem[] = [
  {
    id: '1',
    title: 'NP 1 Suci, Suci, Suci',
    content: [],
  },
  {
    id: '2',
    title: 'NP 2 Tuhan Yang Mahabesar',
    content: [],
  },
];

const PanelDatabase = () => {
  const setPlaylistAddItem = useSetAtom(atomPlaylistAddItem);
  const [databaseItems] = useState(dummyLyrics);
  const [selectedDatabaseItem, setSelectedDatabaseItem] =
    useState<DatabaseItem | null>(null);
  const selectedDatabaseItemIndex = databaseItems.findIndex(
    (item) => item.id === selectedDatabaseItem?.id,
  );

  const addPlaylistItemHandler = () => {
    const item = databaseItems[selectedDatabaseItemIndex];
    item && setPlaylistAddItem(item);
  };

  const itemListHandler = listController({
    items: databaseItems,
    selectedItemIndex: selectedDatabaseItemIndex,
    setSelectedItemIndex: (index) => {
      setSelectedDatabaseItem(databaseItems[index]);
    },
  });

  // Show Item Preview
  const setPreviewItem = useSetAtom(atomPreviewItem);
  const setPreviewContentSelectedLineIndex = useSetAtom(
    atomPreviewItemContentSelectedLineIndex,
  );
  const showPreviewHandler = () => {
    setPreviewItem(selectedDatabaseItem);
    setPreviewContentSelectedLineIndex(
      selectedDatabaseItem?.content[0] ? 0 : -1,
    );
  };
  useEffect(showPreviewHandler, [selectedDatabaseItem]);

  return (
    <BasePanel>
      <BasePanelHeader>
        <h2 className="px-2">Database</h2>
      </BasePanelHeader>
      <div className="flex flex-1 divide-x divide-slate-300">
        <BaseList
          className="flex-1"
          scrollToIndex={selectedDatabaseItemIndex}
          onKeyDownArrowUp={itemListHandler.shiftSelectedItemUp}
          onKeyDownArrowDown={itemListHandler.shiftSelectedItemDown}
          onFocus={showPreviewHandler}
        >
          {databaseItems.map((item) => (
            <BaseListLine
              className="py-1 px-2 select-none"
              key={item.id}
              isSelected={item.id === selectedDatabaseItem?.id}
              onClick={() => setSelectedDatabaseItem(item)}
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
