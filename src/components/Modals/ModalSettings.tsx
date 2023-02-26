import { atomScreenSettings, SCREEN_BASE_SIZE } from '@/stores/screenStore';
import { ColorInput, Modal, NumberInput, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useAtom } from 'jotai';

export type ModalSettingsProps = {
  isOpen: boolean;
  handler: ReturnType<typeof useDisclosure>[1];
};

const ModalSettings = ({ isOpen, handler }: ModalSettingsProps) => {
  const [screenSettings, setScreenSettings] = useAtom(atomScreenSettings);

  const changeScreenSize = <
    Key extends keyof typeof screenSettings.mainSize,
    Val extends (typeof screenSettings.mainSize)[Key],
  >(
    key: Key,
    value: Val,
  ) =>
    setScreenSettings((prevSettings) => ({
      ...prevSettings,
      mainSize: {
        ...prevSettings.mainSize,
        [key]: value,
      },
    }));

  return (
    <Modal title="Settings" opened={isOpen} onClose={handler.close}>
      <Stack>
        <NumberInput
          label="Font size"
          value={screenSettings.mainSize.fontSize}
          onChange={(value) =>
            changeScreenSize('fontSize', value || SCREEN_BASE_SIZE.fontSize)
          }
        />
        <NumberInput
          label="Line height"
          value={screenSettings.mainSize.lineHeight}
          onChange={(value) =>
            changeScreenSize('lineHeight', value || SCREEN_BASE_SIZE.lineHeight)
          }
        />
        <NumberInput
          label="Padding"
          value={screenSettings.mainSize.padding}
          onChange={(value) =>
            changeScreenSize('padding', value || SCREEN_BASE_SIZE.padding)
          }
        />

        <ColorInput
          label="Text color"
          sx={{ input: { fontFamily: 'monospace' } }}
          value={screenSettings.textColor}
          onChange={(value) =>
            setScreenSettings((prevSettings) => ({
              ...prevSettings,
              textColor: value,
            }))
          }
        />
      </Stack>
    </Modal>
  );
};

export default ModalSettings;
