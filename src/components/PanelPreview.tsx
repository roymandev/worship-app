import BaseList from '@/components/BaseList';
import BasePanel from '@/components/BasePanel';
import BasePanelHeader from '@/components/BasePanelHeader';
import ItemContentLine from '@/components/ItemContentLine';
import Screen, { ScreenRef } from '@/components/Screen';
import { liveStore } from '@/stores/liveStore';
import { previewStore } from '@/stores/previewStore';
import { Text, Title } from '@mantine/core';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import Split from 'react-split';

const PanelPreview = forwardRef<ScreenRef>((props, ref) => {
  const item = useAtomValue(previewStore.item);
  const [selectedLineIndex, setSelectedLineIndex] = useAtom(
    previewStore.selectedLineIndex,
  );
  const selectedLine = useAtomValue(previewStore.selectedLine);

  const screenRef = useRef<ScreenRef | null>(null);

  // Set live item
  const showLive = useSetAtom(liveStore.show);
  const setLiveItemHandler = () => showLive(item, selectedLineIndex);

  useImperativeHandle(ref, () => ({
    resizeScreen: () => screenRef.current?.resizeScreen(),
  }));

  return (
    <Split
      direction="vertical"
      gutterSize={2}
      onDrag={() => screenRef.current?.resizeScreen()}
    >
      <BasePanel>
        <BasePanelHeader>
          <Title size="h6" weight="normal">
            Preview
          </Title>
        </BasePanelHeader>

        <BasePanelHeader sub>
          <Text fz={14}>{item?.title}</Text>
        </BasePanelHeader>

        {item && (
          <BaseList
            items={item.content}
            selectedItemIndex={selectedLineIndex}
            onSelectItem={(item, index) => setSelectedLineIndex(index)}
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
