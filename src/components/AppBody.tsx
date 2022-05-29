import Split from 'react-split';
import BasePanel from './BasePanel';

const AppBody = () => {
  return (
    <Split className="flex overflow-hidden flex-1" gutterSize={3}>
      <BasePanel>Playlist</BasePanel>
      <BasePanel>Preview</BasePanel>
      <BasePanel>Live</BasePanel>
    </Split>
  );
};

export default AppBody;
