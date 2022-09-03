import BasePanelHeader from '@/components/BasePanelHeader';
import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import usePlaylist from '@/hooks/usePlaylist';
import { atomPlaylistPanelContent } from '@/stores/playlistStore';
import { useSetAtom } from 'jotai';

const ContentExport = () => {
  const { name, download } = usePlaylist();
  const setPanelContent = useSetAtom(atomPlaylistPanelContent);

  const downloadHandler = () => {
    download();
    setPanelContent('list');
  };

  return (
    <>
      <BasePanelHeader sub>
        <h3 className="px-1">Export</h3>
      </BasePanelHeader>

      <div className="space-y-3 p-3">
        <p>
          Download &quot;<b>{name || 'Untitled'}.WORSHIP</b>&quot; playlist.
        </p>

        <ButtonPrimary color="blue" onClick={downloadHandler}>
          Download
        </ButtonPrimary>

        <ButtonPrimary
          color="gray"
          className="ml-1"
          onClick={() => setPanelContent('list')}
        >
          Cancel
        </ButtonPrimary>
      </div>
    </>
  );
};

export default ContentExport;
