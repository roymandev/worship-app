import Header from '@/components/Header';
import PanelDatabase from '@/components/PanelDatabase';
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
    <div className="fixed inset-0 flex flex-col bg-slate-300 text-sm text-slate-700">
      <Header />

      <Split
        className="flex flex-1 overflow-hidden p-1"
        gutterSize={4}
        onDrag={dragHandler}
      >
        <Split direction="vertical" gutterSize={4}>
          <PanelPlaylist />
          <PanelDatabase />
        </Split>
        <PanelPreview ref={panelPreviewScreenRef} />
        <PanelLive ref={panelLiveScreenRef} />
      </Split>
    </div>
  );
};

export default Home;
