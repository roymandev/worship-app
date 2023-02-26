import ContentItemEditor from '@/components/PanelPlaylist/ContentItemEditor';
import ContentList from '@/components/PanelPlaylist/ContentList';
import { atomPlaylistPanelContent } from '@/stores/layoutStore';
import { ActionIcon, Title, Tooltip } from '@mantine/core';
import { IconListCheck, IconPlus } from '@tabler/icons-react';
import { useAtom } from 'jotai';
import BasePanelHeader from '../BasePanelHeader';

const PanelPlaylist = () => {
  const [content, setContent] = useAtom(atomPlaylistPanelContent);

  return (
    <>
      <BasePanelHeader>
        <IconListCheck size={18} />
        <Title size="h6" weight="normal">
          Playlist
        </Title>

        <Tooltip label="Add item">
          <ActionIcon
            color="blue"
            size="md"
            variant="filled"
            ml="auto"
            mr="-6px"
            onClick={() => setContent('addItem')}
          >
            <IconPlus size={18} />
          </ActionIcon>
        </Tooltip>
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
