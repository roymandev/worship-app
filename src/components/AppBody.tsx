import Split from 'react-split';
import BasePanel from './BasePanel';
import PanelPlaylist from './PanelPlaylist';

const AppBody = () => {
  return (
    <Split className="flex overflow-hidden flex-1" gutterSize={3}>
      <PanelPlaylist />
      <BasePanel>Preview</BasePanel>
      <BasePanel>Live</BasePanel>
    </Split>
  );
};

export default AppBody;
