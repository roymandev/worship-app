import { useSetAtom } from 'jotai';
import { useState } from 'react';
import { validatePlaylist } from '../../lib/validatePlaylist';
import {
  atomPlaylistItems,
  atomPlaylistName,
  atomPlaylistPanelContent,
} from '../../stores/playlistStore';
import { PlaylistItem } from '../../types/itemTypes';
import BasePanelHeader from '../BasePanelHeader';
import ButtonDefault from '../Buttons/ButtonDefault';

const ERROR_UNKNOWN_FILE = 'Unknown file, please upload .WORSHIP file';

const PanelPlaylistImport = () => {
  const setPanelContent = useSetAtom(atomPlaylistPanelContent);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const setName = useSetAtom(atomPlaylistName);
  const setItems = useSetAtom(atomPlaylistItems);
  const [newName, setNewName] = useState('');
  const [newItems, setNewItems] = useState<PlaylistItem[]>([]);
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
              if (newPlaylist.name) setNewName(newPlaylist.name);
              setNewItems(validatePlaylist(newPlaylist.items));
              console.log(validatePlaylist(newPlaylist.items));
            } else setErrorMsg(ERROR_UNKNOWN_FILE);
          }
        };
        reader.readAsText(file);
      }
    }
  };

  const importHandler = () => {
    setName(newName);
    setItems(newItems);
    setPanelContent('list');
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
          className="file:py-1 file:px-3 w-full file:text-inherit file:bg-slate-200 hover:file:bg-slate-300 file:rounded file:border file:border-slate-300 hover:file:border-slate-400 file:border-solid file:outline-none file:cursor-pointer"
          accept=".WORSHIP"
          onChange={onChangeHandler}
        />
        {errorMsg && <div className="text-red-500">{errorMsg}</div>}

        <ButtonDefault
          color="blue"
          disabled={errorMsg !== null || !selectedFile}
          onClick={importHandler}
        >
          Import Selected File
        </ButtonDefault>
        <ButtonDefault
          color="gray"
          className="ml-1"
          onClick={() => setPanelContent('list')}
        >
          Cancel
        </ButtonDefault>
      </div>
    </>
  );
};

export default PanelPlaylistImport;
