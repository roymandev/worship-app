import { Anchor, Modal, Stack, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

export type ModalAboutProps = {
  isOpen: boolean;
  handler: ReturnType<typeof useDisclosure>[1];
};

const ModalAbout = ({ isOpen, handler }: ModalAboutProps) => {
  return (
    <Modal title="About" opened={isOpen} onClose={handler.close}>
      <Stack>
        <Title size="h2">Worship App</Title>
        <Text>
          Worship App is a web-based application designed to enhance the worship
          experience for churches by providing an easy way to display lyrics
          during services.
        </Text>

        <Anchor href="https://github.com/roymandev/worship-app" target="_blank">
          Repository
        </Anchor>
      </Stack>
    </Modal>
  );
};

export default ModalAbout;
