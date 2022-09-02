import BaseList from '@/components/BaseList';
import BasePanel from '@/components/BasePanel';
import BasePanelHeader from '@/components/BasePanelHeader';
import ItemContentLine from '@/components/ItemContentLine';
import Screen, { ScreenRef } from '@/components/Screen';
import { atomPlaylistSelectedItem } from '@/stores/playlistStore';
import {
  atomPreviewItem,
  atomPreviewItemContentSelectedLine,
  atomPreviewItemContentSelectedLineIndex,
} from '@/stores/previewStore';
import { useAtom, useAtomValue } from 'jotai';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import Split from 'react-split';

const PanelPreview = forwardRef<ScreenRef>((props, ref) => {
  const [item, setItem] = useAtom(atomPreviewItem);
  const [contentSelectedLineIndex, setContentSelectedLineIndex] = useAtom(
    atomPreviewItemContentSelectedLineIndex,
  );
  const selectedPlaylistItem = useAtomValue(atomPlaylistSelectedItem);
  const selectedLine = useAtomValue(atomPreviewItemContentSelectedLine);
  const screenRef = useRef<ScreenRef | null>(null);

  useEffect(() => {
    setItem(selectedPlaylistItem);
    setContentSelectedLineIndex(selectedPlaylistItem?.content[0] ? 0 : -1);
  }, [selectedPlaylistItem]);

  useImperativeHandle(ref, () => ({
    resizeScreen: () => screenRef.current?.resizeScreen(),
  }));

  return (
    <Split
      direction="vertical"
      gutterSize={4}
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
