import BaseInput from '@/components/BaseInput';
import BaseList from '@/components/BaseList';
import BaseListItem from '@/components/BaseListItem';
import BasePanelHeader from '@/components/BasePanelHeader';
import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import {
  atomDatabasePanelContent,
  atomSongs,
  atomSongsSelectedItem,
  atomSongsSelectedItemId,
} from '@/stores/databaseStore';
import { atomPlaylistItems } from '@/stores/playlistStore';
import {
  atomPreviewItem,
  atomPreviewItemContentSelectedLineIndex,
} from '@/stores/previewStore';
import { atomUser } from '@/stores/userStore';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useState } from 'react';
import { RiPencilLine, RiPlayListAddFill } from 'react-icons/ri';

const ContentList = () => {
  const user = useAtomValue(atomUser);
  const setPanelContent = useSetAtom(atomDatabasePanelContent);

  const setPlaylistItems = useSetAtom(atomPlaylistItems);
  const setPreviewItem = useSetAtom(atomPreviewItem);
  const setPreviewItemContentSelectedLineIndex = useSetAtom(
    atomPreviewItemContentSelectedLineIndex,
  );

  const songs = useAtomValue(atomSongs);
  const [selectedItemId, setSelectedItemId] = useAtom(atomSongsSelectedItemId);
  const selectedItem = useAtomValue(atomSongsSelectedItem);

  const [search, setSearch] = useState('');

  const onSelectItemHandler = (index: number) => {
    const item = songs[index] || null;
    if (item) {
      setSelectedItemId(item.id);
      setPreviewItem(item);
      setPreviewItemContentSelectedLineIndex(item.content[0] ? 0 : -1);
    }
  };

  const addToPlaylistHandler = () => {
    if (selectedItem)
      setPlaylistItems((prevItems) => [...prevItems, selectedItem]);
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

      <div className="flex flex-1 divide-x divide-zinc-600 overflow-hidden">
        <BaseList
          items={songs}
          selectedItemIndex={songs.findIndex(
            (item) => item.id === selectedItemId,
          )}
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
            className="p-1.5"
            onClick={addToPlaylistHandler}
            disabled={!selectedItem}
          >
            <RiPlayListAddFill className="h-4 w-4" />
          </ButtonPrimary>

          {user && (
            <>
              <hr className="border-zinc-600" />
              <ButtonPrimary
                tabIndex={-1}
                withIcon
                onClick={() => setPanelContent('editItem')}
                disabled={!selectedItemId}
              >
                <RiPencilLine className="h-4 w-4" />
              </ButtonPrimary>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ContentList;
