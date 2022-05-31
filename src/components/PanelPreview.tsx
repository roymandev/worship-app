import { useAtomValue, useSetAtom } from 'jotai';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import Split from 'react-split';
import {
  liveItemAtom,
  liveItemSelectedLineIndexAtom,
} from '../stores/liveStore';
import { playlistSelectedItemAtom } from '../stores/playlistStore';
import BaseList from './BaseList';
import BasePanel from './BasePanel';
import BasePanelHeader from './BasePanelHeader';
import ItemContentLine from './ItemContentLine';
import TextScreen, { TextScreenRef } from './TextScreen';

const PanelPreview = forwardRef<TextScreenRef>((props, ref) => {
  const playlistSelectedItem = useAtomValue(playlistSelectedItemAtom);
  const [selectedLineIndex, setSelectedLineIndex] = useState(-1);
  const setLiveItem = useSetAtom(liveItemAtom);
  const setLiveItemSelectedLineIndex = useSetAtom(
    liveItemSelectedLineIndexAtom,
  );

  const setLiveItemHandler = (index: number) => {
    console.log('a');
    if (playlistSelectedItem) {
      setLiveItem(playlistSelectedItem);
      setLiveItemSelectedLineIndex(index);
    }
  };

  useEffect(() => {
    setSelectedLineIndex(playlistSelectedItem?.content[0] ? 0 : -1);
  }, [playlistSelectedItem]);

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
          <h2 className="px-2">{playlistSelectedItem?.title}</h2>
        </BasePanelHeader>
        <BaseList
          className="leading-4 whitespace-pre-line"
          items={playlistSelectedItem?.content ?? []}
          scrollToIndex={selectedLineIndex}
          renderItem={(line, index) => (
            <ItemContentLine
              key={index}
              line={line}
              isSelected={index === selectedLineIndex}
              onClick={() => setSelectedLineIndex(index)}
              onDoubleClick={() => setLiveItemHandler(index)}
            />
          )}
        />
      </BasePanel>
      <BasePanel>
        <TextScreen
          ref={textScreenRef}
          line={playlistSelectedItem?.content[selectedLineIndex]}
        />
      </BasePanel>
    </Split>
  );
});
PanelPreview.displayName = 'PanelPreview';

export default PanelPreview;
