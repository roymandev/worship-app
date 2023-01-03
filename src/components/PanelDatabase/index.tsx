import BasePanel from '@/components/BasePanel';
import BasePanelHeader from '@/components/BasePanelHeader';
import LoadingSpinner from '@/components/Fallback/LoadingSpinner';
import ContentList from '@/components/PanelDatabase/ContentList';
import useDatabase from '@/hooks/useDatabase';
import { atomSongs } from '@/stores/databaseStore';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';

const PanelDatabase = () => {
  const [loading, setLoading] = useState(true);
  const songs = useAtomValue(atomSongs);
  const { fetchAllSongs } = useDatabase();

  useEffect(() => {
    if (songs.length) {
      setLoading(false);
    } else {
      setLoading(true);
      fetchAllSongs().then(() => setLoading(false));
    }
  }, []);

  return (
    <BasePanel>
      <BasePanelHeader>
        <h2 className="px-1">Database</h2>
      </BasePanelHeader>

      {loading ? <LoadingSpinner /> : <ContentList />}
    </BasePanel>
  );
};

export default PanelDatabase;
