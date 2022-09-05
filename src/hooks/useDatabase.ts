import { firestore } from '@/lib/firebase';
import { parseItemContent } from '@/lib/parseItemContent';
import { atomSongs } from '@/stores/databaseStore';
import { SongItem } from '@/types';
import { collection, getDocs } from 'firebase/firestore';
import { useSetAtom } from 'jotai';

const useDatabase = () => {
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

  return { fetchAllSongs };
};

export default useDatabase;
