import BaseList from '@/components/BaseList';
import BasePanel from '@/components/BasePanel';
import BasePanelHeader from '@/components/BasePanelHeader';
import usePlaylist from '@/hooks/usePlaylist';
import ItemContentLine from '@/components/ItemContentLine';
import Screen, { ScreenRef } from '@/components/Screen';
import { atomLiveItemContentSelectedLine } from '@/stores/liveStore';
import { useAtomValue } from 'jotai';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import Split from 'react-split';
import useLive from '@/hooks/useLive';
import useScreen from '@/hooks/useScreen';
import { ActionIcon, Button, Text, Title, Tooltip } from '@mantine/core';
import {
  IconExternalLink,
  IconPresentation,
  IconPresentationOff,
  IconTypography,
  IconTypographyOff,
  IconX,
} from '@tabler/icons-react';

const PanelLive = forwardRef((props, ref) => {
  const { shiftSelectedItemUp, shiftSelectedItemDown } = usePlaylist();

  const { settings, changeSetting } = useScreen();

  const { item, show, selectedLineIndex, setSelectedLineIndex } = useLive();
  const selectedLine = useAtomValue(atomLiveItemContentSelectedLine);

  const screenRef = useRef<ScreenRef | null>(null);

  useImperativeHandle(ref, () => ({
    resizeScreen: () => screenRef.current?.resizeScreen(),
  }));

  return (
    <Split
      direction="vertical"
      gutterSize={2}
      onDrag={() => screenRef.current?.resizeScreen()}
    >
      <BasePanel>
        <BasePanelHeader>
          <Title size="h6" weight="normal">
            Live
          </Title>

          {item && (
            <Tooltip label="Clear item">
              <ActionIcon
                color="gray"
                size="md"
                variant="filled"
                ml="auto"
                mr="-6px"
                onClick={() => show(null)}
              >
                <IconX size={18} />
              </ActionIcon>
            </Tooltip>
          )}
        </BasePanelHeader>

        <BasePanelHeader sub>
          <Text fz={14}>{item?.title}</Text>
        </BasePanelHeader>

        {item && (
          <BaseList
            items={item.content}
            selectedItemIndex={selectedLineIndex}
            onSelectItem={(item, index) => setSelectedLineIndex(index)}
            renderItem={(item, isSelected, index) => (
              <ItemContentLine
                key={index}
                line={item}
                isSelected={isSelected}
                onClick={() => setSelectedLineIndex(index)}
              />
            )}
            onKeyDownArrowLeft={shiftSelectedItemUp}
            onKeyDownArrowRight={shiftSelectedItemDown}
          />
        )}
      </BasePanel>

      <BasePanel>
        <BasePanelHeader spacing={4}>
          <Title size="h6" weight="normal">
            Live Preview
          </Title>

          <Tooltip label="Toggle blank screen">
            <ActionIcon
              color={settings.hideScreen ? 'red' : 'gray'}
              size="md"
              variant="filled"
              ml="auto"
              onClick={() =>
                changeSetting('hideScreen', (prevValue) => !prevValue)
              }
            >
              {settings.hideScreen ? (
                <IconPresentationOff size={18} />
              ) : (
                <IconPresentation size={18} />
              )}
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Toggle text">
            <ActionIcon
              color={settings.hideText ? 'yellow' : 'gray'}
              size="md"
              variant="filled"
              onClick={() =>
                changeSetting('hideText', (prevValue) => !prevValue)
              }
            >
              {settings.hideText ? (
                <IconTypographyOff size={18} />
              ) : (
                <IconTypography size={18} />
              )}
            </ActionIcon>
          </Tooltip>

          <Button
            color="blue"
            size="xs"
            variant="filled"
            ml={8}
            mr="-6px"
            rightIcon={<IconExternalLink size={18} />}
            onClick={() =>
              window.open(
                '/screen',
                '_blank',
                'location=yes,height=570,width=520,scrollbars=yes,status=yes',
              )
            }
          >
            Screen
          </Button>
        </BasePanelHeader>

        <Screen ref={screenRef} line={selectedLine} options={settings} />
      </BasePanel>
    </Split>
  );
});

PanelLive.displayName = 'PanelLive';

export default PanelLive;
