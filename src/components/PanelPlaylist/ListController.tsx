import { atomPlaylistPanelContent } from '@/stores/layoutStore';
import { playlistStore } from '@/stores/playlistStore';
import { ActionIcon, Divider, Stack, Tooltip } from '@mantine/core';
import {
  IconChevronDown,
  IconChevronUp,
  IconPencil,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { useAtomValue, useSetAtom } from 'jotai';

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

  const selectedItem = useAtomValue(playlistStore.selectedItem);
  const canShiftSelectedItemUp = useAtomValue(
    playlistStore.canShiftSelectedItemUp,
  );
  const canShiftSelectedItemDown = useAtomValue(
    playlistStore.canShiftSelectedItemDown,
  );
  const moveSelectedItemUp = useSetAtom(playlistStore.moveSelectedItemUp);
  const moveSelectedItemDown = useSetAtom(playlistStore.moveSelectedItemDown);
  const deleteSelectedItem = useSetAtom(playlistStore.deleteSelectedItem);

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
        disabled={!canShiftSelectedItemUp || !selectedItem}
      >
        <IconChevronUp size={18} />
      </ListControllerItem>

      <ListControllerItem
        label="Move selected item down"
        onClick={moveSelectedItemDown}
        disabled={!canShiftSelectedItemDown || !selectedItem}
      >
        <IconChevronDown size={18} />
      </ListControllerItem>

      <Divider />

      <ListControllerItem
        label="Edit selected item"
        onClick={() => setContent('editItem')}
        disabled={!selectedItem}
      >
        <IconPencil size={18} />
      </ListControllerItem>

      <ListControllerItem
        label="Remove selected item"
        onClick={deleteSelectedItem}
        disabled={!selectedItem}
      >
        <IconTrash size={18} />
      </ListControllerItem>
    </Stack>
  );
};

export default ListController;
