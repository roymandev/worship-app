import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import Split from 'react-split';
import { listController } from '../lib/listController';
import {
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
import ItemContentLine from './ItemContentLine';
import TextScreen, { TextScreenRef } from './TextScreen';

const PanelLive = forwardRef<TextScreenRef>((props, ref) => {
  const liveItem = useAtomValue(atomLiveItem);
  const liveItemSelectedLine = useAtomValue(atomLiveItemContentSelectedLine);
  const [liveItemSelectedLineIndex, setLiveItemSelectedLineIndex] = useAtom(
    atomLiveItemContentSelectedLineIndex,
  );

  const contentHandler = listController({
    items: liveItem?.content ?? [],
    selectedItemIndex: liveItemSelectedLineIndex,
    setSelectedItemIndex: (index) => setLiveItemSelectedLineIndex(index),
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
        </BasePanelHeader>

        <BasePanelHeader sub>
          <h2 className="px-2">{liveItem?.title}</h2>
        </BasePanelHeader>

        <BaseList
          className="leading-4 whitespace-pre-line"
          scrollToIndex={liveItemSelectedLineIndex}
          onKeyDownArrowUp={contentHandler.shiftSelectedItemUp}
          onKeyDownArrowDown={contentHandler.shiftSelectedItemDown}
          onKeyDownArrowLeft={playlistShiftSelectedItemUp}
          onKeyDownArrowRight={playlistShiftSelectedItemDown}
        >
          {liveItem?.content.map((line, index) => (
            <ItemContentLine
              key={index}
              line={line}
              isSelected={index === liveItemSelectedLineIndex}
              onClick={() => setLiveItemSelectedLineIndex(index)}
            />
          ))}
        </BaseList>
      </BasePanel>

      <BasePanel>
        <TextScreen ref={textScreenRef} line={liveItemSelectedLine} />
      </BasePanel>
    </Split>
  );
});
PanelLive.displayName = 'PanelLive';

export default PanelLive;
