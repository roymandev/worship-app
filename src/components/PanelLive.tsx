import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import Split from 'react-split';
import { listController } from '../lib/listController';
import {
  liveItemAtom,
  liveItemSelectedLineAtom,
  liveItemSelectedLineIndexAtom,
} from '../stores/liveStore';
import {
  playlistShiftSelectedItemDownAtom,
  playlistShiftSelectedItemUpAtom,
} from '../stores/playlistStore';
import { BaseItemContentLine } from '../types/playlistTypes';
import BaseList from './BaseList';
import BasePanel from './BasePanel';
import BasePanelHeader from './BasePanelHeader';
import ItemContentLine from './ItemContentLine';
import TextScreen, { TextScreenRef } from './TextScreen';

const PanelLive = forwardRef<TextScreenRef>((props, ref) => {
  const liveItem = useAtomValue(liveItemAtom);
  const liveItemSelectedLine = useAtomValue(liveItemSelectedLineAtom);
  const [liveItemSelectedLineIndex, setLiveItemSelectedLineIndex] = useAtom(
    liveItemSelectedLineIndexAtom,
  );

  const contentHandler = listController({
    items: liveItem?.content ?? [],
    selectedItemIndex: liveItemSelectedLineIndex,
    setSelectedItemIndex: (index) => setLiveItemSelectedLineIndex(index),
  });

  // playlistStore handler
  const playlistShiftSelectedItemUp = useSetAtom(
    playlistShiftSelectedItemUpAtom,
  );
  const playlistShiftSelectedItemDown = useSetAtom(
    playlistShiftSelectedItemDownAtom,
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

  // Render live item content line
  const renderContentLine = (line: BaseItemContentLine, index: number) => (
    <ItemContentLine
      key={index}
      line={line}
      isSelected={index === liveItemSelectedLineIndex}
      onClick={() => setLiveItemSelectedLineIndex(index)}
    />
  );

  return (
    <Split direction="vertical" gutterSize={4} onDrag={onDragHandler}>
      <BasePanel>
        <BasePanelHeader>
          <h2 className="px-2">Preview</h2>
        </BasePanelHeader>

        <BasePanelHeader sub>
          <h2 className="px-2">{liveItem?.title}</h2>
        </BasePanelHeader>

        <BaseList
          className="leading-4 whitespace-pre-line"
          items={liveItem?.content ?? []}
          scrollToIndex={liveItemSelectedLineIndex}
          onKeyDownArrowUp={contentHandler.shiftSelectedItemUp}
          onKeyDownArrowDown={contentHandler.shiftSelectedItemDown}
          onKeyDownArrowLeft={playlistShiftSelectedItemUp}
          onKeyDownArrowRight={playlistShiftSelectedItemDown}
          renderItem={renderContentLine}
        />
      </BasePanel>

      <BasePanel>
        <TextScreen ref={textScreenRef} line={liveItemSelectedLine} />
      </BasePanel>
    </Split>
  );
});
PanelLive.displayName = 'PanelLive';

export default PanelLive;
