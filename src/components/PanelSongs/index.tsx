import ResultList from '@/components/PanelSongs/ResultList';
import ListController from '@/components/PanelSongs/ListController';
import Header from '@/components/PanelSongs/Header';

const PanelSongs = () => {
  return (
    <>
      <Header />

      <div className="flex flex-1 divide-x divide-zinc-700 overflow-hidden">
        <ResultList />
        <ListController />
      </div>
    </>
  );
};

export default PanelSongs;
