import { PLAYLIST_FILE_EXT } from '@/constant';
import usePlaylist from '@/hooks/usePlaylist';
import { validatePlaylistItems } from '@/lib/validatePlaylistItems';
import {
  atomLeftPanelContent,
  atomPlaylistPanelContent,
} from '@/stores/layoutStore';
import { PlaylistFile } from '@/types';
import {
  Button,
  Code,
  FileInput,
  Group,
  Modal,
  Stack,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';
import { useSetAtom } from 'jotai';
import { useState } from 'react';

const ERROR_UNKNOWN_FILE = 'Unknown file, please upload .WORSHIP file';

export type ModalPlaylistImportProps = {
  isOpen: boolean;
  handler: ReturnType<typeof useDisclosure>[1];
};

const ModalPlaylistImport = ({ isOpen, handler }: ModalPlaylistImportProps) => {
  const setLeftPanelContent = useSetAtom(atomLeftPanelContent);
  const setPlaylistPanelContent = useSetAtom(atomPlaylistPanelContent);

  const [errorMsg, setErrorMsg] = useState('');
  const [playlist, setPlaylist] = useState<PlaylistFile | null>(null);
  const { upload } = usePlaylist();

  const fileChangeHandler = (file: File | null) => {
    setErrorMsg('');
    setPlaylist(null);

    if (!file) return;

    const fileName = file.name.split('.');

    // Check file extension
    if (fileName.pop() !== PLAYLIST_FILE_EXT.substring(1)) {
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

  const closeHandler = () => {
    setPlaylist(null);
    handler.close();
  };

  const importHandler = () => {
    if (playlist) {
      upload(playlist);

      showNotification({
        color: 'green',
        icon: <IconCheck size={20} />,
        title: 'Success import playlist',
        message: playlist?.name,
        autoClose: 2000,
      });

      setLeftPanelContent('playlist');
      setPlaylistPanelContent('list');

      closeHandler();
    }
  };

  return (
    <Modal
      title="Import Playlist"
      withCloseButton={false}
      opened={isOpen}
      onClose={closeHandler}
    >
      <Stack>
        <FileInput
          placeholder="Select .WORSHIP file"
          label={
            <Text mb="xs">
              Upload <Code fw="bold">.WORSHIP</Code> file to import playlist.
            </Text>
          }
          accept=".WORSHIP"
          onChange={fileChangeHandler}
          error={errorMsg}
        />

        <Group spacing="xs" position="right">
          <Button
            color="blue"
            disabled={!!errorMsg || !playlist}
            onClick={importHandler}
          >
            Import selected playlist
          </Button>

          <Button color="gray" onClick={closeHandler}>
            Cancel
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default ModalPlaylistImport;
