import ContentItemEditor from '@/components/PanelPlaylist/ContentItemEditor';
import ContentList from '@/components/PanelPlaylist/ContentList';
import { atomPlaylistPanelContent } from '@/stores/playlistStore';
import { Title } from '@mantine/core';
import { IconListCheck } from '@tabler/icons-react';
import { useAtomValue } from 'jotai';
import BasePanelHeader from '../BasePanelHeader';

const PanelPlaylist = () => {
  const content = useAtomValue(atomPlaylistPanelContent);

  return (
    <>
      <BasePanelHeader>
        <IconListCheck size={18} />
        <Title size="h6" weight="normal">
          Playlist
        </Title>
      </BasePanelHeader>

      {content === 'list' ? (
        <ContentList />
      ) : content === 'editItem' ? (
        <ContentItemEditor />
      ) : (
        content === 'addItem' && <ContentItemEditor newItem />
      )}
    </>
  );
};

export default PanelPlaylist;
