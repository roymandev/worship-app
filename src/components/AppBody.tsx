import Split from 'react-split';
import BasePanel from './BasePanel';
import PanelPlaylist from './PanelPlaylist';
import PanelPreview from './PanelPreview';

const AppBody = () => {
  return (
    <Split className="flex overflow-hidden flex-1" gutterSize={3}>
      <PanelPlaylist />
      <PanelPreview />
      <BasePanel>Live</BasePanel>
    </Split>
  );
};

export default AppBody;
