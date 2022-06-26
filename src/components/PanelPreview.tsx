import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import Split from 'react-split';
import { listController } from '../lib/listController';
import {
  atomLiveItem,
  atomLiveItemContentSelectedLineIndex,
} from '../stores/liveStore';
import {
  atomPreviewItem,
  atomPreviewItemContentSelectedLineIndex,
} from '../stores/previewStore';
import BaseList from './BaseList';
import BasePanel from './BasePanel';
import BasePanelHeader from './BasePanelHeader';
import ItemContentLine from './ItemContentLine';
import TextScreen, { TextScreenRef } from './TextScreen';

const PanelPreview = forwardRef<TextScreenRef>((props, ref) => {
  const previewItem = useAtomValue(atomPreviewItem);
  const [contentSelectedLineIndex, setContentSelectedLineIndex] = useAtom(
    atomPreviewItemContentSelectedLineIndex,
  );

  const contentHandler = listController({
    items: previewItem?.content ?? [],
    selectedItemIndex: contentSelectedLineIndex,
    setSelectedItemIndex: (index) => setContentSelectedLineIndex(index),
  });

  // Set Live Item
  const setLiveItem = useSetAtom(atomLiveItem);
  const setLiveItemSelectedLineIndex = useSetAtom(
    atomLiveItemContentSelectedLineIndex,
  );
  const setLiveItemHandler = (index: number) => {
    if (previewItem) {
      setLiveItem(previewItem);
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

  return (
    <Split direction="vertical" gutterSize={4} onDrag={onDragHandler}>
      <BasePanel>
        <BasePanelHeader>
          <h2 className="px-2">Preview</h2>
        </BasePanelHeader>

        <BasePanelHeader sub>
          <h2 className="px-2">{previewItem?.title}</h2>
        </BasePanelHeader>

        <BaseList
          className="leading-4 whitespace-pre-line"
          scrollToIndex={contentSelectedLineIndex}
          onKeyDownArrowUp={contentHandler.shiftSelectedItemUp}
          onKeyDownArrowDown={contentHandler.shiftSelectedItemDown}
          onKeyDownEnter={() => setLiveItemHandler(contentSelectedLineIndex)}
          tabIndex={previewItem?.content.length ? 0 : -1}
        >
          {previewItem?.content.map((line, index) => (
            <ItemContentLine
              key={index}
              line={line}
              isSelected={index === contentSelectedLineIndex}
              onClick={() => setContentSelectedLineIndex(index)}
              onDoubleClick={() => setLiveItemHandler(index)}
            />
          ))}
        </BaseList>
      </BasePanel>

      <BasePanel>
        <TextScreen ref={textScreenRef} line={contentHandler.selectedItem()} />
      </BasePanel>
    </Split>
  );
});
PanelPreview.displayName = 'PanelPreview';

export default PanelPreview;
