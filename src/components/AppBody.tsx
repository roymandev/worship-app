import Split from 'react-split';

const AppBody = () => {
  return (
    <Split className="flex overflow-hidden flex-1" gutterSize={3}>
      <div>Playlist</div>
      <div>Preview</div>
      <div>Live</div>
    </Split>
  );
};

export default AppBody;
