import usePlaylist from '@/hooks/usePlaylist';
import { atomPlaylistPanelContent } from '@/stores/layoutStore';
import { ActionIcon, Divider, Stack, Tooltip } from '@mantine/core';
import {
  IconChevronDown,
  IconChevronUp,
  IconPencil,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { useSetAtom } from 'jotai';

type ListControllerItem = {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  label: string;
};

const ListControllerItem = ({
  onClick,
  disabled,
  children,
  label,
}: ListControllerItem) => {
  return (
    <Tooltip label={label} position="right">
      <ActionIcon
        size="md"
        variant="filled"
        onClick={onClick}
        disabled={disabled}
        sx={{
          '&[disabled]': {
            pointerEvents: 'all',
            backgroundColor: 'unset',
            border: 0,
          },
        }}
      >
        {children}
      </ActionIcon>
    </Tooltip>
  );
};

const ListController = () => {
  const setContent = useSetAtom(atomPlaylistPanelContent);

  const {
    selectedItemId,
    canShiftSelectedItemUp,
    canShiftSelectedItemDown,
    moveSelectedItemUp,
    moveSelectedItemDown,
    deleteSelectedItem,
  } = usePlaylist();

  return (
    <Stack w={36} p={4} spacing={4}>
      <Tooltip label="Add item" position="right">
        <ActionIcon
          color="blue"
          size="md"
          variant="filled"
          onClick={() => setContent('addItem')}
        >
          <IconPlus size={18} />
        </ActionIcon>
      </Tooltip>

      <Divider />

      <ListControllerItem
        label="Move selected item up"
        onClick={moveSelectedItemUp}
        disabled={!canShiftSelectedItemUp() || !selectedItemId}
      >
        <IconChevronUp size={18} />
      </ListControllerItem>

      <ListControllerItem
        label="Move selected item down"
        onClick={moveSelectedItemDown}
        disabled={!canShiftSelectedItemDown() || !selectedItemId}
      >
        <IconChevronDown size={18} />
      </ListControllerItem>

      <Divider />

      <ListControllerItem
        label="Edit selected item"
        onClick={() => setContent('editItem')}
        disabled={!selectedItemId}
      >
        <IconPencil size={18} />
      </ListControllerItem>

      <ListControllerItem
        label="Remove selected item"
        onClick={deleteSelectedItem}
        disabled={!selectedItemId}
      >
        <IconTrash size={18} />
      </ListControllerItem>
    </Stack>
  );
};

export default ListController;
