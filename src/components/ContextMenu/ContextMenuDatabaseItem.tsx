import { useAtomValue, useSetAtom } from 'jotai';
import { RiPlayFill, RiPlayListAddFill } from 'react-icons/ri';
import { atomContextMenuActive } from '../../stores/contextMenuStore';
import { atomDatabaseParsedSelectedItem } from '../../stores/databaseStore';
import {
  atomLiveItem,
  atomLiveItemContentSelectedLineIndex,
} from '../../stores/liveStore';
import { atomPlaylistAddItem } from '../../stores/playlistStore';
import ButtonContextMenu from '../Buttons/ButtonContextMenu';

const ContextMenuDatabaseItem = () => {
  const setActive = useSetAtom(atomContextMenuActive);
  const databaseParsedSelectedItem = useAtomValue(
    atomDatabaseParsedSelectedItem,
  );

  // Add to playlist handler
  const setPlaylistAddItem = useSetAtom(atomPlaylistAddItem);
  const handleAddToPlaylist = () => {
    databaseParsedSelectedItem &&
      setPlaylistAddItem(databaseParsedSelectedItem);
    setActive(null);
  };

  // Go live hanlder
  const setLiveItem = useSetAtom(atomLiveItem);
  const setLiveItemContentSelectedLineIndex = useSetAtom(
    atomLiveItemContentSelectedLineIndex,
  );
  const handleGoLive = () => {
    setLiveItem(databaseParsedSelectedItem);
    setLiveItemContentSelectedLineIndex(
      databaseParsedSelectedItem?.content[0] ? 0 : -1,
    );
    setActive(null);
  };

  return (
    <>
      <ButtonContextMenu color="blue" onClick={handleGoLive}>
        Go Live
        <RiPlayFill className="h-4 w-4" />
      </ButtonContextMenu>
      <hr className="my-1" />
      <ButtonContextMenu color="gray" onClick={handleAddToPlaylist}>
        Add to playlist
        <RiPlayListAddFill className="h-4 w-4" />
      </ButtonContextMenu>
    </>
  );
};

export default ContextMenuDatabaseItem;
