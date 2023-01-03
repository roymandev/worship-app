import { firestore } from '@/lib/firebase';
import { parseItemContent } from '@/lib/parseItemContent';
import { atomSongs } from '@/stores/databaseStore';
import { BaseItem } from '@/types';
import { collection, getDocs } from 'firebase/firestore';
import { useSetAtom } from 'jotai';

const useDatabase = () => {
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

  return { fetchAllSongs };
};

export default useDatabase;
