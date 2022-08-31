import { FILE_EXT } from '@/constant';
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

  const upload = (playlist: PlaylistFile) => {
    setName(playlist.name);
    setItems(playlist.items || []);
  };

  const download = () =>
    downloadObject({ items }, (name || 'Untitled') + FILE_EXT);

  return {
    name,
    setName,
    items,
    setItems,
    selectedItemId,
    setSelectedItemId,
    upload,
    download,
  };
};

export default usePlaylist;
