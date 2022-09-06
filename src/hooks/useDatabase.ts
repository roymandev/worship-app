import useAuth from '@/hooks/useAuth';
import { firestore } from '@/lib/firebase';
import { parseItemContent } from '@/lib/parseItemContent';
import { atomSongs } from '@/stores/databaseStore';
import { BaseItem } from '@/types';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { useSetAtom } from 'jotai';

const useDatabase = () => {
  const { user } = useAuth();
  const setSongs = useSetAtom(atomSongs);
  const songsRef = collection(firestore, 'songs');

  const fetchAllSongs = async () => {
    try {
      const querySnapshot = await getDocs(songsRef);

      const songs: BaseItem[] = [];

      querySnapshot.forEach((doc) =>
        songs.push({
          ...doc.data(),
          id: doc.id,
          content: parseItemContent(doc.data().content),
        } as BaseItem),
      );

      setSongs(songs);
    } catch (error) {
      console.error('Error load songs: ', error);
    }
  };

  const editSongById = async (updatedItem: BaseItem) => {
    if (!user) {
      console.log('Unauthorized');
      return;
    }

    try {
      setSongs((prevSongs) =>
        prevSongs.map((song) =>
          song.id === updatedItem.id ? { ...song, ...updatedItem } : song,
        ),
      );

      const docRef = doc(songsRef, updatedItem.id);

      await updateDoc(docRef, {
        title: updatedItem.title,
        content: updatedItem.content.map((line) => line.text).join('\n\n'),
      });
    } catch (error) {
      console.error('Error edit song: ', error);
    }
  };

  return { fetchAllSongs, editSongById };
};

export default useDatabase;
