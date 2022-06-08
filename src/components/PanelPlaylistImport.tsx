import { useSetAtom } from 'jotai';
import { useState } from 'react';
import { validatePlaylist } from '../lib/validatePlaylist';
import { atomPlaylistItems, atomPlaylistName } from '../stores/playlistStore';
import { PlaylistItem } from '../types/playlistTypes';
import BaseButton from './BaseButton';
import BasePanelHeader from './BasePanelHeader';

const ERROR_UNKNOWN_FILE = 'Unknown file, please upload .WORSHIP file';

interface PanelPlaylistImportProps {
  close: () => void;
}
const PanelPlaylistImport = ({ close }: PanelPlaylistImportProps) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const setPlaylistName = useSetAtom(atomPlaylistName);
  const setPlaylistItems = useSetAtom(atomPlaylistItems);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistItems, setNewPlaylistItems] = useState<PlaylistItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<File>();

  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = event.currentTarget.files?.[0];
    setSelectedFile(file);

    if (file) {
      const fileExt = file.name.split('.').pop();
      if (fileExt !== 'WORSHIP') {
        setErrorMsg(ERROR_UNKNOWN_FILE);
      } else {
        const reader = new FileReader();
        reader.onload = (evt) => {
          if (evt.target?.result) {
            const newPlaylist = (() => {
              try {
                return JSON.parse(evt.target.result as string) as {
                  name: string;
                  items: PlaylistItem[];
                };
              } catch {
                return null;
              }
            })();

            if (newPlaylist) {
              if (newPlaylist.name) setNewPlaylistName(newPlaylist.name);
              setNewPlaylistItems(validatePlaylist(newPlaylist.items));
              console.log(validatePlaylist(newPlaylist.items));
            } else setErrorMsg(ERROR_UNKNOWN_FILE);
          }
        };
        reader.readAsText(file);
      }
    }
  };

  const importHandler = () => {
    setPlaylistName(newPlaylistName);
    setPlaylistItems(newPlaylistItems);
    close();
  };

  return (
    <>
      <BasePanelHeader sub>
        <h2 className="px-2">Import</h2>
      </BasePanelHeader>
      <div className="p-3 space-y-3">
        <p>
          Upload <b>.WORSHIP</b> file to import
        </p>
        <input
          type="file"
          className="file:py-1 file:px-2 w-full file:text-inherit file:bg-slate-200 hover:file:bg-slate-300 file:rounded file:border file:border-slate-300 hover:file:border-slate-400 file:border-solid file:outline-none file:cursor-pointer"
          accept=".WORSHIP"
          onChange={onChangeHandler}
        />
        {errorMsg && <div className="text-red-500">{errorMsg}</div>}
        <BaseButton
          variant="primary"
          className="py-1 px-2"
          disabled={errorMsg !== null || !selectedFile}
          onClick={importHandler}
        >
          Import Selected File
        </BaseButton>
      </div>
    </>
  );
};

export default PanelPlaylistImport;
