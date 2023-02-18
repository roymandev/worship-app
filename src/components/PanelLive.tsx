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
import {
  RiCloseFill,
  RiExternalLinkLine,
  RiEyeLine,
  RiEyeOffLine,
  RiFormatClear,
  RiText,
} from 'react-icons/ri';
import useLive from '@/hooks/useLive';
import Button from '@/components/Button';
import useScreen from '@/hooks/useScreen';

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
          <h2 className="px-1">Live</h2>

          {item && (
            <Button
              title="Clear item"
              icon
              className="ml-auto"
              onClick={() => show(null)}
            >
              <RiCloseFill className="h-4 w-4" />
            </Button>
          )}
        </BasePanelHeader>

        <BasePanelHeader sub>
          <h3 className="px-1">{item?.title}</h3>
        </BasePanelHeader>

        {item && (
          <BaseList
            className="whitespace-pre-line leading-4"
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
        <BasePanelHeader>
          <h2 className="px-1">Live Screen Preview</h2>

          <Button
            title="Toggle blank screen"
            color={settings.hideScreen ? 'red' : 'gray'}
            icon
            className="ml-auto"
            onClick={() =>
              changeSetting('hideScreen', (prevValue) => !prevValue)
            }
          >
            {settings.hideScreen ? (
              <RiEyeOffLine className="h-4 w-4" />
            ) : (
              <RiEyeLine className="h-4 w-4" />
            )}
          </Button>

          <Button
            title="Toggle screen text"
            color={settings.hideText ? 'yellow' : 'gray'}
            icon
            onClick={() => changeSetting('hideText', (prevValue) => !prevValue)}
          >
            {settings.hideText ? (
              <RiFormatClear className="h-4 w-4" />
            ) : (
              <RiText className="h-4 w-4" />
            )}
          </Button>

          <Button
            title="Open new screen"
            color="blue"
            icon
            onClick={() =>
              window.open(
                '/screen',
                '_blank',
                'location=yes,height=570,width=520,scrollbars=yes,status=yes',
              )
            }
            className="ml-2"
          >
            <RiExternalLinkLine className="h-4 w-4" />
          </Button>
        </BasePanelHeader>
        <Screen ref={screenRef} line={selectedLine} options={settings} />
      </BasePanel>
    </Split>
  );
});

PanelLive.displayName = 'PanelLive';

export default PanelLive;
