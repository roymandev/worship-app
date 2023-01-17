import BasePanelHeader from '@/components/BasePanelHeader';
import { Tabs } from '@/components/PanelLeft';
import { HeaderButton } from '@/components/PanelLeft/HeaderButton';
import { atomPlaylistItems } from '@/stores/playlistStore';
import { useAtomValue } from 'jotai';

type HeaderProps = {
  tab: Tabs;
  setTab: (tab: Tabs) => void;
};
const Header = ({ tab, setTab }: HeaderProps) => {
  const playlistItems = useAtomValue(atomPlaylistItems);

  return (
    <BasePanelHeader className="z-10 items-stretch gap-0 p-0">
      <HeaderButton
        active={tab === 'playlist'}
        onClick={() => setTab('playlist')}
      >
        Playlist
        <span className="rounded bg-zinc-900 py-0.5 px-2">
          {playlistItems.length}
        </span>
      </HeaderButton>
    </BasePanelHeader>
  );
};

export default Header;
