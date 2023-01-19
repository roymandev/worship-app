import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import { atomPlaylistItems } from '@/stores/playlistStore';
import { atomSongsSelectedSong } from '@/stores/searchStore';
import { useAtomValue, useSetAtom } from 'jotai';
import { RiPlayListAddFill } from 'react-icons/ri';

const ListController = () => {
  const selectedSong = useAtomValue(atomSongsSelectedSong);
  const setPlaylistItems = useSetAtom(atomPlaylistItems);

  const addPlaylistItemHandler = () => {
    if (selectedSong)
      setPlaylistItems((prevItems) => [...prevItems, selectedSong]);
  };

  return (
    <div className="flex flex-col gap-1 p-1">
      <ButtonPrimary
        title="Add Song to Playlist"
        tabIndex={-1}
        withIcon
        disabled={!selectedSong}
        onClick={addPlaylistItemHandler}
      >
        <RiPlayListAddFill className="h-4 w-4" />
      </ButtonPrimary>
    </div>
  );
};

export default ListController;
