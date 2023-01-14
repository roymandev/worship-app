import BaseList from '@/components/BaseList';
import BasePanel from '@/components/BasePanel';
import BasePanelHeader from '@/components/BasePanelHeader';
import ItemContentLine from '@/components/ItemContentLine';
import Screen, { ScreenRef } from '@/components/Screen';
import usePreview from '@/hooks/usePreview';
import {
  atomLiveItem,
  atomLiveItemContentSelectedLineIndex,
} from '@/stores/liveStore';
import { atomPreviewItemContentSelectedLine } from '@/stores/previewStore';
import { useAtomValue, useSetAtom } from 'jotai';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import Split from 'react-split';

const PanelPreview = forwardRef<ScreenRef>((props, ref) => {
  const { item, selectedLineIndex, setSelectedLineIndex } = usePreview();
  const selectedLine = useAtomValue(atomPreviewItemContentSelectedLine);
  const screenRef = useRef<ScreenRef | null>(null);

  // Set live item
  const setLiveItem = useSetAtom(atomLiveItem);
  const setLiveItemContentSelectedLineIndex = useSetAtom(
    atomLiveItemContentSelectedLineIndex,
  );
  const setLiveItemHandler = () => {
    setLiveItem(item);
    setLiveItemContentSelectedLineIndex(selectedLineIndex);
  };

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
          <h2 className="px-1">Preview</h2>
        </BasePanelHeader>

        <BasePanelHeader sub>
          <h2 className="px-1">{item?.title}</h2>
        </BasePanelHeader>

        {item && (
          <BaseList
            className="whitespace-pre-line leading-4"
            items={item.content}
            selectedItemIndex={selectedLineIndex}
            onSelectItem={(index) => setSelectedLineIndex(index)}
            onKeyDownEnter={setLiveItemHandler}
            renderItem={(item, isSelected, index) => (
              <ItemContentLine
                key={index}
                line={item}
                isSelected={isSelected}
                onClick={() => setSelectedLineIndex(index)}
                onDoubleClick={setLiveItemHandler}
              />
            )}
          />
        )}
      </BasePanel>

      <BasePanel>
        <Screen ref={screenRef} line={selectedLine} />
      </BasePanel>
    </Split>
  );
});

PanelPreview.displayName = 'PanelPreview';

export default PanelPreview;
