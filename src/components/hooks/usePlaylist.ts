import { FILE_EXT } from '@/constant';
import { downloadObject } from '@/lib/downloadObject';
import { atomPlaylistItems, atomPlaylistName } from '@/stores/playlistStore';
import { PlaylistFile } from '@/types';
import { useAtom } from 'jotai';

const usePlaylist = () => {
  const [name, setName] = useAtom(atomPlaylistName);
  const [items, setItems] = useAtom(atomPlaylistItems);

  const upload = (playlist: PlaylistFile) => {
    setName(playlist.name);
    setItems(playlist.items || []);
  };

  const download = () => downloadObject({ items }, name + FILE_EXT);

  return { name, items, upload, download };
};

export default usePlaylist;
