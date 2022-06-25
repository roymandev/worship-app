import Split from 'react-split';
import PanelDatabase from './PanelDatabase';
import PanelPlaylist from './PanelPlaylist/PanelPlaylist';

const PanelLeft = () => {
  return (
    <Split direction="vertical" gutterSize={4}>
      <PanelPlaylist />
      <PanelDatabase />
    </Split>
  );
};

export default PanelLeft;
