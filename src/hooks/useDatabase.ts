import useAuth from '@/hooks/useAuth';
import { firestore } from '@/lib/firebase';
import { parseItemContent } from '@/lib/parseItemContent';
import { atomSongs } from '@/stores/databaseStore';
import { BaseItem, SongItem } from '@/types';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { useSetAtom } from 'jotai';

const useDatabase = () => {
  const { user } = useAuth();
  const setSongs = useSetAtom(atomSongs);
  const songsRef = collection(firestore, 'songs');

  const fetchAllSongs = async () => {
    try {
      const querySnapshot = await getDocs(songsRef);

      const songs: SongItem[] = [];

      querySnapshot.forEach((doc) =>
        songs.push({
          ...doc.data(),
          id: doc.id,
          content: parseItemContent(doc.data().content),
        } as SongItem),
      );

      setSongs(songs);
    } catch (error) {
      console.error('Error load songs: ', error);
    }
  };

  const editSongById = async (id: string, update: BaseItem) => {
    if (!user) {
      console.log('Unauthorized');
      return;
    }

    try {
      setSongs((prevSongs) =>
        prevSongs.map((song) =>
          song.id === id ? { ...song, ...update } : song,
        ),
      );

      const docRef = doc(songsRef, id);

      await updateDoc(docRef, {
        title: update.title,
        content: update.content.map((line) => line.text).join('\n\n'),
      });
    } catch (error) {
      console.error('Error edit song: ', error);
    }
  };

  return { fetchAllSongs, editSongById };
};

export default useDatabase;
