import PanelLive from '@/components/PanelLive';
import PanelPlaylist from '@/components/PanelPlaylist';
import PanelPreview from '@/components/PanelPreview';
import { ScreenRef } from '@/components/Screen';
import { useEffect, useRef } from 'react';
import Split from 'react-split';

const Home = () => {
  const panelPreviewScreenRef = useRef<ScreenRef | null>(null);
  const panelLiveScreenRef = useRef<ScreenRef | null>(null);

  const dragHandler = () => {
    panelPreviewScreenRef.current?.resizeScreen();
    panelLiveScreenRef.current?.resizeScreen();
  };

  useEffect(() => {
    window.addEventListener('resize', dragHandler);
    return () => window.removeEventListener('resize', dragHandler);
  }, []);

  return (
    <Split
      className="fixed inset-0 flex bg-slate-300 p-1 text-sm text-slate-700"
      gutterSize={4}
      onDrag={dragHandler}
    >
      <PanelPlaylist />
      <PanelPreview ref={panelPreviewScreenRef} />
      <PanelLive ref={panelLiveScreenRef} />
    </Split>
  );
};

export default Home;
