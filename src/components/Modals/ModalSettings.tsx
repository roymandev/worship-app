import { BASE_SCREEN_SETTINGS } from '@/schemas/screenSchema';
import { atomScreenSettings } from '@/stores/screenStore';
import { Button, ColorInput, Modal, NumberInput, Stack } from '@mantine/core';
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

  const resetHandler = () => setScreenSettings(BASE_SCREEN_SETTINGS);

  return (
    <Modal title="Settings" opened={isOpen} onClose={handler.close}>
      <Stack>
        <NumberInput
          label="Font size"
          value={screenSettings.mainSize.fontSize}
          onChange={(value) =>
            changeScreenSize(
              'fontSize',
              value || BASE_SCREEN_SETTINGS.mainSize.fontSize,
            )
          }
        />
        <NumberInput
          label="Line height"
          value={screenSettings.mainSize.lineHeight}
          onChange={(value) =>
            changeScreenSize(
              'lineHeight',
              value || BASE_SCREEN_SETTINGS.mainSize.lineHeight,
            )
          }
        />
        <NumberInput
          label="Padding"
          value={screenSettings.mainSize.padding}
          onChange={(value) =>
            changeScreenSize(
              'padding',
              value || BASE_SCREEN_SETTINGS.mainSize.padding,
            )
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

        <ColorInput
          label="Background color"
          sx={{ input: { fontFamily: 'monospace' } }}
          value={screenSettings.backgroundColor}
          onChange={(value) =>
            setScreenSettings((prevSettings) => ({
              ...prevSettings,
              backgroundColor: value,
            }))
          }
        />

        <Button color="gray" onClick={resetHandler}>
          Reset to default
        </Button>
      </Stack>
    </Modal>
  );
};

export default ModalSettings;
