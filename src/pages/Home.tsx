import BasePanel from '@/components/BasePanel';
import PanelPlaylist from '@/components/PanelPlaylist';
import PanelPreview from '@/components/PanelPreview';
import Split from 'react-split';

const Home = () => {
  return (
    <Split
      className="fixed inset-0 flex bg-slate-300 p-1 text-sm text-slate-700"
      gutterSize={4}
    >
      <PanelPlaylist />
      <PanelPreview />
      <BasePanel>Right</BasePanel>
    </Split>
  );
};

export default Home;
