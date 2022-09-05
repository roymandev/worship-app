import BasePanel from '@/components/BasePanel';
import BasePanelHeader from '@/components/BasePanelHeader';
import Loading from '@/components/Fallback/Loading';
import ContentList from '@/components/PanelDatabase/ContentList';
import useDatabase from '@/hooks/useDatabase';
import { atomDatabasePanelContent } from '@/stores/databaseStore';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';

const PanelDatabase = () => {
  const panelContent = useAtomValue(atomDatabasePanelContent);
  const [loading, setLoading] = useState(true);
  const { fetchAllSongs } = useDatabase();

  useEffect(() => {
    setLoading(true);
    fetchAllSongs().then(() => setLoading(false));
  }, []);

  return (
    <BasePanel>
      <BasePanelHeader>
        <h2 className="px-1">Database</h2>
      </BasePanelHeader>

      {loading ? (
        <Loading className="rounded" />
      ) : (
        !panelContent && <ContentList />
      )}
    </BasePanel>
  );
};

export default PanelDatabase;
