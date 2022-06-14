import { useSetAtom } from 'jotai';
import { useAtomCallback, useAtomValue } from 'jotai/utils';
import { useCallback } from 'react';
import { downloadObject } from '../../lib/downloadObject';
import {
  atomPlaylistItems,
  atomPlaylistName,
  atomPlaylistPanelContent,
} from '../../stores/playlistStore';
import BasePanelHeader from '../BasePanelHeader';
import ButtonDefault from '../Buttons/ButtonDefault';

const PanelPlaylistExport = () => {
  const playlistName = useAtomValue(atomPlaylistName) || 'Untitled';
  const setPlaylistPanelContent = useSetAtom(atomPlaylistPanelContent);

  const handleDownload = useAtomCallback(
    useCallback((get) => {
      const playlistItems = get(atomPlaylistItems);

      downloadObject(
        { name: playlistName, items: playlistItems },
        playlistName + '.WORSHIP',
      );
      setPlaylistPanelContent('list');
    }, []),
  );

  return (
    <>
      <BasePanelHeader sub>
        <h2 className="px-2">Export</h2>
      </BasePanelHeader>

      <div className="p-3 space-y-3">
        <p>
          Download &quot;<b>{playlistName}.WORSHIP</b>&quot; playlist.
        </p>

        <ButtonDefault color="blue" onClick={handleDownload}>
          Download
        </ButtonDefault>

        <ButtonDefault
          color="gray"
          className="ml-1"
          onClick={() => setPlaylistPanelContent('list')}
        >
          Cancel
        </ButtonDefault>
      </div>
    </>
  );
};

export default PanelPlaylistExport;
