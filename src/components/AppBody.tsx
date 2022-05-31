import Split from 'react-split';
import BasePanel from './BasePanel';
import PanelPlaylist from './PanelPlaylist';
import PanelPreview from './PanelPreview';

const AppBody = () => {
  return (
    <Split className="flex overflow-hidden flex-1 p-1" gutterSize={4}>
      <PanelPlaylist />
      <PanelPreview />
      <Split direction="vertical" gutterSize={4}>
        <BasePanel>Live Content</BasePanel>
        <BasePanel>Live Screen</BasePanel>
      </Split>
    </Split>
  );
};

export default AppBody;
