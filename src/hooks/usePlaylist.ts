import { PLAYLIST_FILE_EXT } from '@/constant';
import { downloadObject } from '@/lib/downloadObject';
import {
  atomPlaylistItems,
  atomPlaylistName,
  atomPlaylistSelectedItemId,
} from '@/stores/playlistStore';
import { PlaylistFile } from '@/types';
import { useAtom } from 'jotai';

const usePlaylist = () => {
  const [name, setName] = useAtom(atomPlaylistName);
  const [items, setItems] = useAtom(atomPlaylistItems);
  const [selectedItemId, setSelectedItemId] = useAtom(
    atomPlaylistSelectedItemId,
  );

  const getSelectedItemIndex = () =>
    items.findIndex((item) => item.id === selectedItemId);

  const canShiftSelectedItemUp = () => items[getSelectedItemIndex() - 1];
  const canShiftSelectedItemDown = () => items[getSelectedItemIndex() + 1];

  const upload = (playlist: PlaylistFile) => {
    setName(playlist.name);
    setItems(playlist.items || []);
  };

  const download = () =>
    downloadObject({ items }, (name || 'Untitled') + PLAYLIST_FILE_EXT);

  const shiftSelectedItemUp = () =>
    setSelectedItemId(items[getSelectedItemIndex() - 1].id);

  const shiftSelectedItemDown = () =>
    setSelectedItemId(items[getSelectedItemIndex() + 1].id);

  const moveSelectedItemUp = () => {
    const selectedItemIndex = getSelectedItemIndex();
    if (canShiftSelectedItemUp() && selectedItemId) {
      const newItems = [...items];
      [newItems[selectedItemIndex], newItems[selectedItemIndex - 1]] = [
        newItems[selectedItemIndex - 1],
        newItems[selectedItemIndex],
      ];
      setItems(newItems);
    }
  };

  const moveSelectedItemDown = () => {
    const selectedItemIndex = getSelectedItemIndex();
    if (canShiftSelectedItemDown() && selectedItemId) {
      const newItems = [...items];
      [newItems[selectedItemIndex], newItems[selectedItemIndex + 1]] = [
        newItems[selectedItemIndex + 1],
        newItems[selectedItemIndex],
      ];
      setItems(newItems);
    }
  };

  const deleteSelectedItem = () => {
    if (canShiftSelectedItemUp()) shiftSelectedItemUp();
    else if (canShiftSelectedItemDown()) shiftSelectedItemDown();
    else setSelectedItemId(null);

    setItems((prevItems) =>
      prevItems.filter((item) => item.id !== selectedItemId),
    );
  };

  return {
    name,
    setName,
    items,
    setItems,
    selectedItemId,
    setSelectedItemId,
    canShiftSelectedItemUp,
    canShiftSelectedItemDown,
    upload,
    download,
    deleteSelectedItem,
    shiftSelectedItemUp,
    shiftSelectedItemDown,
    moveSelectedItemUp,
    moveSelectedItemDown,
  };
};

export default usePlaylist;
