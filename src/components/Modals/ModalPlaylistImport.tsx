import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import BaseModal, { BaseModalProps } from '@/components/Modals/BaseModal';
import { FILE_EXT } from '@/constant';
import usePlaylist from '@/hooks/usePlaylist';
import { validatePlaylistItems } from '@/lib/validatePlaylistItems';
import { PlaylistFile } from '@/types';
import { useState } from 'react';

const ERROR_UNKNOWN_FILE = 'Unknown file, please upload .WORSHIP file';

const ModalPlaylistImport = ({ onClose }: Pick<BaseModalProps, 'onClose'>) => {
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
    onClose();
  };

  return (
    <BaseModal onClose={onClose} title="Import Playlist">
      <div className="space-y-3 p-3">
        <p>
          Upload <b>.WORSHIP</b> file to import
        </p>

        <input
          type="file"
          className="w-full file:h-7 file:cursor-pointer file:rounded file:border-none file:bg-zinc-700 file:px-4 file:font-sans file:text-inherit file:shadow file:outline-none hover:file:bg-zinc-600"
          accept=".WORSHIP"
          onChange={fileChangeHandler}
        />

        {errorMsg && <div className="text-red-400">{errorMsg}</div>}

        <div className="flex">
          <ButtonPrimary
            className="ml-auto"
            disabled={!!errorMsg || !playlist}
            onClick={importHandler}
          >
            Import Selected File
          </ButtonPrimary>
          <ButtonPrimary className="ml-1" onClick={onClose}>
            Cancel
          </ButtonPrimary>
        </div>
      </div>
    </BaseModal>
  );
};

export default ModalPlaylistImport;
