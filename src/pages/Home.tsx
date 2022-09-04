import Header from '@/components/Header';
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
    <div className="fixed inset-0 flex flex-col gap-1 bg-slate-300 p-1 text-sm text-slate-700">
      <Header />

      <Split className="flex flex-1" gutterSize={4} onDrag={dragHandler}>
        <PanelPlaylist />
        <PanelPreview ref={panelPreviewScreenRef} />
        <PanelLive ref={panelLiveScreenRef} />
      </Split>
    </div>
  );
};

export default Home;
