import BaseInput from '@/components/BaseInput';
import BaseList from '@/components/BaseList';
import BaseListItem from '@/components/BaseListItem';
import BasePanelHeader from '@/components/BasePanelHeader';
import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import { atomSongs } from '@/stores/databaseStore';
import { atomPlaylistItems } from '@/stores/playlistStore';
import {
  atomPreviewItem,
  atomPreviewItemContentSelectedLineIndex,
} from '@/stores/previewStore';
import { useAtomValue, useSetAtom } from 'jotai';
import { useState } from 'react';
import { RiPlayListAddFill } from 'react-icons/ri';

const ContentList = () => {
  const setPlaylistItems = useSetAtom(atomPlaylistItems);
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

  const addToPlaylistHandler = () => {
    const item = songs[selectedItemIndex] || null;
    if (item) {
      setPlaylistItems((prevItems) => [...prevItems, item]);
    }
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

      <div className="flex flex-1 divide-x divide-slate-300">
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

        <div className="flex flex-col gap-1 p-1">
          <ButtonPrimary
            tabIndex={-1}
            color="blue"
            className="p-1.5"
            onClick={addToPlaylistHandler}
            disabled={selectedItemIndex < 0}
          >
            <RiPlayListAddFill className="h-4 w-4" />
          </ButtonPrimary>
        </div>
      </div>
    </>
  );
};

export default ContentList;
