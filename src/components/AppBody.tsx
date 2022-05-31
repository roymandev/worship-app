import { useRef } from 'react';
import Split from 'react-split';
import PanelLive from './PanelLive';
import PanelPlaylist from './PanelPlaylist';
import PanelPreview from './PanelPreview';
import { TextScreenRef } from './TextScreen';

const AppBody = () => {
  const panelPreviewTextScreenRef = useRef<TextScreenRef | null>(null);
  const panelLiveTextScreenRef = useRef<TextScreenRef | null>(null);

  const onDragHandler = () => {
    panelPreviewTextScreenRef.current?.scaleScreen();
    panelLiveTextScreenRef.current?.scaleScreen();
  };

  return (
    <Split
      className="flex overflow-hidden flex-1 p-1"
      gutterSize={4}
      onDrag={onDragHandler}
    >
      <PanelPlaylist />
      <PanelPreview ref={panelPreviewTextScreenRef} />
      <PanelLive ref={panelLiveTextScreenRef} />
    </Split>
  );
};

export default AppBody;
