import Button from '@/components/Button';
import usePlaylist from '@/hooks/usePlaylist';
import { atomSongsSelectedSong } from '@/stores/searchStore';
import { useAtomValue } from 'jotai';
import { RiPlayListAddFill } from 'react-icons/ri';

const ListController = () => {
  const selectedSong = useAtomValue(atomSongsSelectedSong);
  const { addItem } = usePlaylist();

  const addPlaylistItemHandler = () => {
    if (selectedSong) addItem(selectedSong);
  };

  return (
    <div className="flex flex-col gap-1 p-1">
      <Button
        color="blue"
        icon
        title="Add Song to Playlist"
        tabIndex={-1}
        disabled={!selectedSong}
        onClick={addPlaylistItemHandler}
      >
        <RiPlayListAddFill className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ListController;
