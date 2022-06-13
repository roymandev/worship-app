import { useAtomValue, useSetAtom } from 'jotai';
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
import BaseButton from '../BaseButton';

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
      <BaseButton
        variant="primary"
        className="py-1 text-left px-3"
        onClick={handleGoLive}
      >
        Go Live
      </BaseButton>
      <hr />
      <BaseButton
        variant="default"
        className="py-1 text-left px-3"
        onClick={handleEdit}
      >
        Edit
      </BaseButton>
      <BaseButton
        variant="default"
        className="py-1 text-left px-3"
        onClick={hanldeRemove}
      >
        Remove
      </BaseButton>
      <hr />
      <BaseButton
        variant="red"
        className="py-1 text-left px-3"
        onClick={handleAdd}
      >
        Add Item
      </BaseButton>
    </>
  );
};

export default ContextMenuPlaylistItem;
