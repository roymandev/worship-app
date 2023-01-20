import ResultList from '@/components/PanelSearch/ResultList';
import ListController from '@/components/PanelSearch/ListController';
import Header from '@/components/PanelSearch/Header';

const PanelSearch = () => {
  return (
    <>
      <Header />

      <div className="flex flex-1 divide-x divide-zinc-600 overflow-hidden">
        <ResultList />
        <ListController />
      </div>
    </>
  );
};

export default PanelSearch;
