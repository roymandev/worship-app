import usePlaylist from '@/hooks/usePlaylist';
import { Button, Code, Group, Modal, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

export type ModalPlaylistExportProps = {
  isOpen: boolean;
  handler: ReturnType<typeof useDisclosure>[1];
};

const ModalPlaylistExport = ({ isOpen, handler }: ModalPlaylistExportProps) => {
  const { name, download } = usePlaylist();

  const downloadHandler = () => {
    download();
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
