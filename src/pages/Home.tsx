import BasePanel from '@/components/BasePanel';
import PanelPlaylist from '@/components/PanelPlaylist';
import PanelPreview from '@/components/PanelPreview';
import { ScreenRef } from '@/components/Screen';
import { useRef } from 'react';
import Split from 'react-split';

const Home = () => {
  const panelPreviewScreenRef = useRef<ScreenRef | null>(null);

  const dragHandler = () => {
    panelPreviewScreenRef.current?.resizeScreen();
  };

  return (
    <Split
      className="fixed inset-0 flex bg-slate-300 p-1 text-sm text-slate-700"
      gutterSize={4}
      onDrag={dragHandler}
    >
      <PanelPlaylist />
      <PanelPreview ref={panelPreviewScreenRef} />
      <BasePanel>Right</BasePanel>
    </Split>
  );
};

export default Home;
