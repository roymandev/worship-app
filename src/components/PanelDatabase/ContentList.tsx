import BaseInput from '@/components/BaseInput';
import BaseList from '@/components/BaseList';
import BaseListItem from '@/components/BaseListItem';
import BasePanelHeader from '@/components/BasePanelHeader';
import { atomSongs } from '@/stores/databaseStore';
import {
  atomPreviewItem,
  atomPreviewItemContentSelectedLineIndex,
} from '@/stores/previewStore';
import { useAtomValue, useSetAtom } from 'jotai';
import { useState } from 'react';

const ContentList = () => {
  const setPreviewItem = useSetAtom(atomPreviewItem);
  const setPreviewItemContentSelectedLineIndex = useSetAtom(
    atomPreviewItemContentSelectedLineIndex,
  );

  const songs = useAtomValue(atomSongs);
  const [selectedItemIndex, setSelectedItemIndex] = useState(-1);

  const [search, setSearch] = useState('');

  const onSelectItemHandler = (index: number) => {
    const item = songs[index] || null;
    setSelectedItemIndex(index);
    setPreviewItem(item);
    setPreviewItemContentSelectedLineIndex(item?.content[0] ? 0 : -1);
  };

  return (
    <>
      <BasePanelHeader sub>
        <BaseInput
          className="h-7 flex-1 px-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
        />
      </BasePanelHeader>
      <BaseList
        items={songs}
        selectedItemIndex={selectedItemIndex}
        onSelectItem={onSelectItemHandler}
        renderItem={(song, isSelected, index) => (
          <BaseListItem
            key={song.id}
            className="py-1 px-2"
            isSelected={isSelected}
            onClick={() => onSelectItemHandler(index)}
          >
            {song.title}
          </BaseListItem>
        )}
      />
    </>
  );
};

export default ContentList;
