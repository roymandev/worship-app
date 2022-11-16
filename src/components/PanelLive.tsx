import BaseList from '@/components/BaseList';
import BasePanel from '@/components/BasePanel';
import BasePanelHeader from '@/components/BasePanelHeader';
import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import usePlaylist from '@/hooks/usePlaylist';
import ItemContentLine from '@/components/ItemContentLine';
import Screen, { ScreenRef } from '@/components/Screen';
import {
  atomLiveItem,
  atomLiveItemContentSelectedLine,
  atomLiveItemContentSelectedLineIndex,
} from '@/stores/liveStore';
import { atomScreenSettings } from '@/stores/screenStore';
import { useAtom, useAtomValue } from 'jotai';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import Split from 'react-split';
import { RiExternalLinkLine } from 'react-icons/ri';

const PanelLive = forwardRef((props, ref) => {
  const { shiftSelectedItemUp, shiftSelectedItemDown } = usePlaylist();
  const [screenSettings, setScreenSettings] = useAtom(atomScreenSettings);

  const item = useAtomValue(atomLiveItem);
  const selectedLine = useAtomValue(atomLiveItemContentSelectedLine);
  const [contentSelectedLineIndex, setContentSelectedLineIndex] = useAtom(
    atomLiveItemContentSelectedLineIndex,
  );
  const screenRef = useRef<ScreenRef | null>(null);

  useImperativeHandle(ref, () => ({
    resizeScreen: () => screenRef.current?.resizeScreen(),
  }));

  return (
    <Split
      direction="vertical"
      gutterSize={1}
      onDrag={() => screenRef.current?.resizeScreen()}
    >
      <BasePanel>
        <BasePanelHeader>
          <h2 className="px-1">Live</h2>

          <ButtonPrimary
            className="ml-auto h-full py-0"
            onClick={() =>
              setScreenSettings((prevSettings) => ({
                ...prevSettings,
                hideScreen: !prevSettings.hideScreen,
              }))
            }
          >
            Hide Screen
          </ButtonPrimary>

          <ButtonPrimary
            className="h-full py-0"
            onClick={() =>
              setScreenSettings((prevSettings) => ({
                ...prevSettings,
                hideText: !prevSettings.hideText,
              }))
            }
          >
            Hide Text
          </ButtonPrimary>

          <ButtonPrimary
            withIcon="right"
            onClick={() =>
              window.open(
                '/screen',
                '_blank',
                'location=yes,height=570,width=520,scrollbars=yes,status=yes',
              )
            }
          >
            Open Screen
            <RiExternalLinkLine className="h-4 w-4" />
          </ButtonPrimary>
        </BasePanelHeader>

        <BasePanelHeader sub>
          <h2 className="px-1">{item?.title}</h2>
        </BasePanelHeader>

        {item && (
          <BaseList
            className="whitespace-pre-line leading-4"
            items={item.content}
            selectedItemIndex={contentSelectedLineIndex}
            onSelectItem={(index) => setContentSelectedLineIndex(index)}
            renderItem={(item, isSelected, index) => (
              <ItemContentLine
                key={index}
                line={item}
                isSelected={isSelected}
                onClick={() => setContentSelectedLineIndex(index)}
              />
            )}
            onKeyDownArrowLeft={shiftSelectedItemUp}
            onKeyDownArrowRight={shiftSelectedItemDown}
          />
        )}
      </BasePanel>

      <BasePanel>
        <Screen
          ref={screenRef}
          line={selectedLine}
          options={{
            hideText: screenSettings.hideText,
            hideScreen: screenSettings.hideScreen,
          }}
        />
      </BasePanel>
    </Split>
  );
});

PanelLive.displayName = 'PanelLive';

export default PanelLive;
