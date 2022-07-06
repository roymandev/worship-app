import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import Split from 'react-split';
import { listController } from '../lib/listController';
import {
  atomLiveHideScreen,
  atomLiveHideText,
  atomLiveItem,
  atomLiveItemContentSelectedLine,
  atomLiveItemContentSelectedLineIndex,
} from '../stores/liveStore';
import {
  atomPlaylistShiftSelectedItemDown,
  atomPlaylistShiftSelectedItemUp,
} from '../stores/playlistStore';
import BaseList from './BaseList';
import BasePanel from './BasePanel';
import BasePanelHeader from './BasePanelHeader';
import ButtonDefault from './Buttons/ButtonDefault';
import ItemContentLine from './ItemContentLine';
import TextScreen, { TextScreenRef } from './TextScreen';

const PanelLive = forwardRef<TextScreenRef>((props, ref) => {
  const [hideScreen, setHideScreen] = useAtom(atomLiveHideScreen);
  const [hideText, setHideText] = useAtom(atomLiveHideText);
  const item = useAtomValue(atomLiveItem);
  const itemSelectedLine = useAtomValue(atomLiveItemContentSelectedLine);
  const [itemSelectedLineIndex, setItemSelectedLineIndex] = useAtom(
    atomLiveItemContentSelectedLineIndex,
  );

  const contentHandler = listController({
    items: item?.content ?? [],
    selectedItemIndex: itemSelectedLineIndex,
    setSelectedItemIndex: (index) => setItemSelectedLineIndex(index),
  });

  // playlistStore handler
  const playlistShiftSelectedItemUp = useSetAtom(
    atomPlaylistShiftSelectedItemUp,
  );
  const playlistShiftSelectedItemDown = useSetAtom(
    atomPlaylistShiftSelectedItemDown,
  );

  // Pass scaleScreen method to parent
  const textScreenRef = useRef<TextScreenRef | null>(null);
  const onDragHandler = () => {
    if (textScreenRef.current) {
      textScreenRef.current.scaleScreen();
    }
  };
  useImperativeHandle(ref, () => ({
    scaleScreen: onDragHandler,
  }));

  return (
    <Split direction="vertical" gutterSize={4} onDrag={onDragHandler}>
      <BasePanel>
        <BasePanelHeader>
          <h2 className="px-2">Live</h2>

          <ButtonDefault
            className="h-7 ml-auto mr-1"
            color={hideScreen ? 'red' : 'gray'}
            tabIndex={-1}
            onClick={() => setHideScreen((prev) => !prev)}
          >
            Hide Screen
          </ButtonDefault>
          <ButtonDefault
            className="h-7 mr-1"
            color={hideText ? 'yellow' : 'gray'}
            tabIndex={-1}
            onClick={() => setHideText((prev) => !prev)}
          >
            Hide Text
          </ButtonDefault>
        </BasePanelHeader>

        <BasePanelHeader sub>
          <h2 className="px-2">{item?.title}</h2>
        </BasePanelHeader>

        <BaseList
          className="leading-4 whitespace-pre-line"
          scrollToIndex={itemSelectedLineIndex}
          onKeyDownArrowUp={contentHandler.shiftSelectedItemUp}
          onKeyDownArrowDown={contentHandler.shiftSelectedItemDown}
          onKeyDownArrowLeft={playlistShiftSelectedItemUp}
          onKeyDownArrowRight={playlistShiftSelectedItemDown}
          tabIndex={item?.content.length ? 0 : -1}
        >
          {item?.content.map((line, index) => (
            <ItemContentLine
              key={index}
              line={line}
              isSelected={index === itemSelectedLineIndex}
              onClick={() => setItemSelectedLineIndex(index)}
            />
          ))}
        </BaseList>
      </BasePanel>

      <BasePanel>
        <TextScreen
          ref={textScreenRef}
          line={hideText ? null : itemSelectedLine}
          hideScreen={hideScreen}
        />
      </BasePanel>
    </Split>
  );
});
PanelLive.displayName = 'PanelLive';

export default PanelLive;
