import { useAtomValue, useSetAtom } from 'jotai';
import {
  RiAddLine,
  RiDeleteBin2Line,
  RiPencilFill,
  RiPlayFill,
} from 'react-icons/ri';
import { atomContextMenuActive } from '../../stores/contextMenuStore';
import {
  atomLiveItem,
  atomLiveItemContentSelectedLineIndex,
} from '../../stores/liveStore';
import {
  atomPlaylistPanelContent,
  atomPlaylistRemoveSelectedItem,
  atomPlaylistSelectedItem,
} from '../../stores/playlistStore';
import ButtonContextMenu from '../Buttons/ButtonContextMenu';

const ContextMenuPlaylistItem = () => {
  const setContextMenuActive = useSetAtom(atomContextMenuActive);
  const playlistSelectedItem = useAtomValue(atomPlaylistSelectedItem);
  const setLiveItem = useSetAtom(atomLiveItem);
  const setLiveItemSelectedLineIndex = useSetAtom(
    atomLiveItemContentSelectedLineIndex,
  );
  const setPlaylistPanelContent = useSetAtom(atomPlaylistPanelContent);
  const setPlaylistRemoveSelectedItem = useSetAtom(
    atomPlaylistRemoveSelectedItem,
  );

  const handleGoLive = () => {
    setLiveItem(playlistSelectedItem);
    setLiveItemSelectedLineIndex(playlistSelectedItem?.content[0] ? 0 : -1);
    setContextMenuActive(null);
  };

  const handleEdit = () => {
    setPlaylistPanelContent('itemEditor');
    setContextMenuActive(null);
  };

  const hanldeRemove = () => {
    setPlaylistRemoveSelectedItem();
    setContextMenuActive(null);
  };

  const handleAdd = () => {
    setPlaylistPanelContent('addItem');
    setContextMenuActive(null);
  };

  return (
    <>
      <ButtonContextMenu color="blue" onClick={handleGoLive}>
        Go Live
        <RiPlayFill className="h-4 w-4" />
      </ButtonContextMenu>
      <hr className="my-1" />
      <ButtonContextMenu color="gray" onClick={handleEdit}>
        Edit
        <RiPencilFill className="h-4 w-4" />
      </ButtonContextMenu>
      <ButtonContextMenu color="red" onClick={hanldeRemove}>
        Remove
        <RiDeleteBin2Line className="h-4 w-4" />
      </ButtonContextMenu>
      <hr className="my-1" />
      <ButtonContextMenu color="gray" onClick={handleAdd}>
        Add Item
        <RiAddLine className="h-4 w-4" />
      </ButtonContextMenu>
    </>
  );
};

export default ContextMenuPlaylistItem;
