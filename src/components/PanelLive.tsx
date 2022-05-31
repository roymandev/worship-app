import { useAtom, useAtomValue } from 'jotai';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import Split from 'react-split';
import {
  liveItemAtom,
  liveItemSelectedLineIndexAtom,
} from '../stores/liveStore';
import BaseList from './BaseList';
import BasePanel from './BasePanel';
import BasePanelHeader from './BasePanelHeader';
import ItemContentLine from './ItemContentLine';
import TextScreen, { TextScreenRef } from './TextScreen';

const PanelLive = forwardRef<TextScreenRef>((props, ref) => {
  const liveItem = useAtomValue(liveItemAtom);
  const [liveItemSelectedLineIndex, setLiveItemSelectedLineIndex] = useAtom(
    liveItemSelectedLineIndexAtom,
  );

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
          <h2 className="px-2">Preview</h2>
        </BasePanelHeader>
        <BasePanelHeader sub>
          <h2 className="px-2">{liveItem?.title}</h2>
        </BasePanelHeader>
        <BaseList
          className="leading-4 whitespace-pre-line"
          items={liveItem?.content ?? []}
          scrollToIndex={liveItemSelectedLineIndex}
          renderItem={(line, index) => (
            <ItemContentLine
              key={index}
              line={line}
              isSelected={index === liveItemSelectedLineIndex}
              onClick={() => setLiveItemSelectedLineIndex(index)}
            />
          )}
        />
      </BasePanel>
      <BasePanel>
        <TextScreen
          ref={textScreenRef}
          line={liveItem?.content[liveItemSelectedLineIndex]}
        />
      </BasePanel>
    </Split>
  );
});
PanelLive.displayName = 'PanelLive';

export default PanelLive;
