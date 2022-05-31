import { useRef } from 'react';
import Split from 'react-split';
import BasePanel from './BasePanel';
import PanelPlaylist from './PanelPlaylist';
import PanelPreview from './PanelPreview';
import { TextScreenRef } from './TextScreen';

const AppBody = () => {
  const panelPreviewTextScreenRef = useRef<TextScreenRef | null>(null);

  const onDragHandler = () => {
    panelPreviewTextScreenRef.current?.scaleScreen();
  };

  return (
    <Split
      className="flex overflow-hidden flex-1 p-1"
      gutterSize={4}
      onDrag={onDragHandler}
    >
      <PanelPlaylist />
      <PanelPreview ref={panelPreviewTextScreenRef} />
      <Split direction="vertical" gutterSize={4}>
        <BasePanel>Live Content</BasePanel>
        <BasePanel>Live Screen</BasePanel>
      </Split>
    </Split>
  );
};

export default AppBody;
