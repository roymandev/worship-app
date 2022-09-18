import BasePanel from '@/components/BasePanel';
import BasePanelHeader from '@/components/BasePanelHeader';
import ContentItemEditor from '@/components/ContentItemEditor';
import LoadingSpinner from '@/components/Fallback/LoadingSpinner';
import ContentList from '@/components/PanelDatabase/ContentList';
import useDatabase from '@/hooks/useDatabase';
import {
  atomDatabasePanelContent,
  atomSongsSelectedItem,
} from '@/stores/databaseStore';
import { useAtom, useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';

const PanelDatabase = () => {
  const [panelContent, setPanelContent] = useAtom(atomDatabasePanelContent);
  const [loading, setLoading] = useState(true);
  const { fetchAllSongs, editSongById } = useDatabase();
  const selectedItem = useAtomValue(atomSongsSelectedItem);

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
        <LoadingSpinner />
      ) : !panelContent ? (
        <ContentList />
      ) : (
        panelContent === 'editItem' &&
        selectedItem && (
          <ContentItemEditor
            item={selectedItem}
            title="Edit database item"
            onCancel={() => setPanelContent(null)}
            onSubmit={(item) => {
              editSongById(item);
              setPanelContent(null);
            }}
          />
        )
      )}
    </BasePanel>
  );
};

export default PanelDatabase;
