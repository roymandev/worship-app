import { useAtomValue, useSetAtom } from 'jotai';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import Split from 'react-split';
import { listController } from '../lib/listController';
import {
  liveItemAtom,
  liveItemSelectedLineIndexAtom,
} from '../stores/liveStore';
import { playlistSelectedItemAtom } from '../stores/playlistStore';
import { BaseItemContentLine } from '../types/playlistTypes';
import BaseList from './BaseList';
import BasePanel from './BasePanel';
import BasePanelHeader from './BasePanelHeader';
import ItemContentLine from './ItemContentLine';
import TextScreen, { TextScreenRef } from './TextScreen';

const PanelPreview = forwardRef<TextScreenRef>((props, ref) => {
  const playlistSelectedItem = useAtomValue(playlistSelectedItemAtom);
  const [contentSelectedLineIndex, setContentSelectedLineIndex] = useState(
    playlistSelectedItem?.content[0] ? 0 : -1,
  );

  const contentHandler = listController({
    items: playlistSelectedItem?.content ?? [],
    selectedItemIndex: contentSelectedLineIndex,
    setSelectedItemIndex: (index) => setContentSelectedLineIndex(index),
  });

  // liveStore handler
  const setLiveItem = useSetAtom(liveItemAtom);
  const setLiveItemSelectedLineIndex = useSetAtom(
    liveItemSelectedLineIndexAtom,
  );
  const setLiveItemHandler = (index: number) => {
    if (playlistSelectedItem) {
      setLiveItem(playlistSelectedItem);
      setLiveItemSelectedLineIndex(index);
    }
  };

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

  // Render preview content line
  const renderContentLine = (line: BaseItemContentLine, index: number) => (
    <ItemContentLine
      key={index}
      line={line}
      isSelected={index === contentSelectedLineIndex}
      onClick={() => setContentSelectedLineIndex(index)}
      onDoubleClick={() => setLiveItemHandler(index)}
    />
  );

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
          scrollToIndex={contentSelectedLineIndex}
          onKeyDownArrowUp={contentHandler.shiftSelectedItemUp}
          onKeyDownArrowDown={contentHandler.shiftSelectedItemDown}
          onKeyDownEnter={() => setLiveItemHandler(contentSelectedLineIndex)}
          renderItem={renderContentLine}
        />
      </BasePanel>

      <BasePanel>
        <TextScreen ref={textScreenRef} line={contentHandler.selectedItem()} />
      </BasePanel>
    </Split>
  );
});
PanelPreview.displayName = 'PanelPreview';

export default PanelPreview;
