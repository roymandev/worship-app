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
    <div className="fixed inset-0 flex flex-col bg-zinc-800 text-sm text-zinc-300">
      <Header />

      <Split
        className="flex flex-1 overflow-hidden"
        gutterSize={1}
        onDrag={dragHandler}
      >
        <Split direction="vertical" gutterSize={1}>
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
