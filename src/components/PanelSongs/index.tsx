import ResultList from '@/components/PanelSongs/ResultList';
import ListController from '@/components/PanelSongs/ListController';
import SearchInput from '@/components/PanelSongs/SearchInput';
import BasePanelHeader from '../BasePanelHeader';
import { IconMusic } from '@tabler/icons-react';
import { Title } from '@mantine/core';

const PanelSongs = () => {
  return (
    <>
      <BasePanelHeader>
        <IconMusic size={18} />
        <Title size="h6" weight="normal">
          Song database
        </Title>
      </BasePanelHeader>

      <SearchInput />

      <div className="flex flex-1 divide-x divide-zinc-700 overflow-hidden">
        <ResultList />
        <ListController />
      </div>
    </>
  );
};

export default PanelSongs;
