import { playlistStore } from '@/stores/playlistStore';
import { Button, Code, Group, Modal, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useAtomValue, useSetAtom } from 'jotai';

export type ModalPlaylistExportProps = {
  isOpen: boolean;
  handler: ReturnType<typeof useDisclosure>[1];
};

const ModalPlaylistExport = ({ isOpen, handler }: ModalPlaylistExportProps) => {
  const name = useAtomValue(playlistStore.name);
  const downloadToFile = useSetAtom(playlistStore.downloadToFile);

  const downloadHandler = () => {
    downloadToFile();
    handler.close();
  };

  return (
    <Modal
      title="Export Playlist"
      withCloseButton={false}
      opened={isOpen}
      onClose={handler.close}
    >
      <Stack>
        <Text>
          Download <Code>{name || 'Untitled'}.WORSHIP</Code> playlist.
        </Text>

        <Group spacing="xs" position="right">
          <Button color="blue" onClick={downloadHandler}>
            Download
          </Button>

          <Button color="gray" onClick={handler.close}>
            Cancel
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default ModalPlaylistExport;
