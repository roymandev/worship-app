import { BASE_SCREEN_SETTINGS, screenStore } from '@/stores/screenStore';
import {
  ActionIcon,
  Button,
  ColorInput,
  NumberInput,
  Stack,
  Tabs,
  Title,
} from '@mantine/core';
import {
  IconPhoto,
  IconRotate2,
  IconSettings,
  IconTypography,
} from '@tabler/icons-react';
import { useAtom, useSetAtom } from 'jotai';
import BasePanelHeader from './BasePanelHeader';

const PanelSettings = () => {
  const [screenSettings, setScreenSettings] = useAtom(screenStore.settings);
  const setScreenSizes = useSetAtom(screenStore.updateSizes);

  const resetHandler = () => {
    setScreenSettings((prevSettings) => ({
      ...BASE_SCREEN_SETTINGS,
      sizes: {
        ...BASE_SCREEN_SETTINGS.sizes,
        width: prevSettings.sizes.width,
        height: prevSettings.sizes.height,
      },
    }));
  };

  return (
    <>
      <BasePanelHeader>
        <IconSettings size={18} />
        <Title size="h6" weight="normal">
          Settings
        </Title>

        <Button
          color="gray"
          size="xs"
          variant="filled"
          ml="auto"
          mr="-6px"
          leftIcon={<IconRotate2 size={18} />}
          onClick={resetHandler}
        >
          Reset Default
        </Button>
      </BasePanelHeader>

      <Tabs
        defaultValue="text"
        styles={{ tab: { borderRadius: 0 }, panel: { padding: 10 } }}
      >
        <Tabs.List>
          <Tabs.Tab value="text" icon={<IconTypography size={14} />}>
            Text
          </Tabs.Tab>
          <Tabs.Tab value="background" icon={<IconPhoto size={14} />}>
            Background
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="text">
          <Stack>
            <NumberInput
              label="Font size"
              value={screenSettings.sizes.fontSize}
              onChange={(value) =>
                setScreenSizes({
                  fontSize: value || BASE_SCREEN_SETTINGS.sizes.fontSize,
                })
              }
            />
            <NumberInput
              label="Line height"
              value={screenSettings.sizes.lineHeight}
              onChange={(value) =>
                setScreenSizes({
                  lineHeight: value || BASE_SCREEN_SETTINGS.sizes.lineHeight,
                })
              }
            />
            <NumberInput
              label="Padding"
              value={screenSettings.sizes.padding}
              onChange={(value) =>
                setScreenSizes({
                  padding: value || BASE_SCREEN_SETTINGS.sizes.padding,
                })
              }
            />

            <ColorInput
              label="Text color"
              rightSection={
                screenSettings.textColor !== BASE_SCREEN_SETTINGS.textColor && (
                  <ActionIcon
                    onClick={() =>
                      setScreenSettings((prevSettings) => ({
                        ...prevSettings,
                        textColor: BASE_SCREEN_SETTINGS.textColor,
                      }))
                    }
                  >
                    <IconRotate2 size={18} />
                  </ActionIcon>
                )
              }
              sx={{ input: { fontFamily: 'monospace' } }}
              value={screenSettings.textColor}
              onChangeEnd={(value) =>
                setScreenSettings((prevSettings) => ({
                  ...prevSettings,
                  textColor: value,
                }))
              }
            />
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="background">
          <Stack>
            <ColorInput
              label="Background color"
              rightSection={
                screenSettings.backgroundColor !==
                  BASE_SCREEN_SETTINGS.backgroundColor && (
                  <ActionIcon
                    onClick={() =>
                      setScreenSettings((prevSettings) => ({
                        ...prevSettings,
                        backgroundColor: BASE_SCREEN_SETTINGS.backgroundColor,
                      }))
                    }
                  >
                    <IconRotate2 size={18} />
                  </ActionIcon>
                )
              }
              sx={{ input: { fontFamily: 'monospace' } }}
              value={screenSettings.backgroundColor}
              onChangeEnd={(value) =>
                setScreenSettings((prevSettings) => ({
                  ...prevSettings,
                  backgroundColor: value,
                }))
              }
            />
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </>
  );
};

export default PanelSettings;
