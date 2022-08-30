import BasePanelHeader from '@/components/BasePanelHeader';
import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import usePlaylist from '@/components/hooks/usePlaylist';
import { FILE_EXT } from '@/constant';
import { validatePlaylistItems } from '@/lib/validatePlaylistItems';
import { atomPlaylistPanelContent } from '@/stores/playlistStore';
import { PlaylistFile } from '@/types';
import { useSetAtom } from 'jotai';
import { useState } from 'react';

const ERROR_UNKNOWN_FILE = 'Unknown file, please upload .WORSHIP file';

const ContentImport = () => {
  const setPanelContent = useSetAtom(atomPlaylistPanelContent);
  const [errorMsg, setErrorMsg] = useState('');
  const [playlist, setPlaylist] = useState<PlaylistFile | null>(null);
  const { upload } = usePlaylist();

  const fileChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    setPlaylist(null);
    const file = event.currentTarget.files?.[0];

    if (!file) return;

    const fileName = file.name.split('.');

    // Check file extension
    if (fileName.pop() !== FILE_EXT.substring(1)) {
      setErrorMsg(ERROR_UNKNOWN_FILE);
      return;
    }

    const fileReader = new FileReader();

    fileReader.onload = (evt) => {
      if (!evt.target?.result) return;

      try {
        const playlistData = JSON.parse(
          evt.target.result as string,
        ) as PlaylistFile;

        console.log(playlistData);

        const validatedItems = validatePlaylistItems(playlistData.items);

        setPlaylist({
          name: fileName.join(),
          items: validatedItems ?? [],
        });
      } catch {
        setErrorMsg(ERROR_UNKNOWN_FILE);
      }
    };

    fileReader.readAsText(file);
  };

  const importHandler = () => {
    playlist && upload(playlist);
    setPanelContent('list');
  };

  return (
    <>
      <BasePanelHeader sub>
        <h2 className="px-1">Import</h2>
      </BasePanelHeader>
      <div className="space-y-3 p-3">
        <p>
          Upload <b>.WORSHIP</b> file to import
        </p>
        <input
          type="file"
          className="w-full file:cursor-pointer file:rounded file:border file:border-solid file:border-slate-300 file:bg-slate-200 file:py-1 file:px-3 file:text-inherit file:outline-none hover:file:border-slate-400 hover:file:bg-slate-300"
          accept=".WORSHIP"
          onChange={fileChangeHandler}
        />
        {errorMsg && <div className="text-red-500">{errorMsg}</div>}

        <ButtonPrimary
          color="blue"
          disabled={!!errorMsg || !playlist}
          onClick={importHandler}
        >
          Import Selected File
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

export default ContentImport;
