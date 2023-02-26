import BasePanelHeader from '@/components/BasePanelHeader';
import usePlaylist from '@/hooks/usePlaylist';
import usePreview from '@/hooks/usePreview';
import { ParsedContentLine, parseItemContent } from '@/lib/parseItemContent';
import { atomPlaylistPanelContent } from '@/stores/layoutStore';
import { atomPlaylistSelectedItem } from '@/stores/playlistStore';
import {
  Box,
  Button,
  Group,
  Stack,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { useAtom, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';

export type ContentItemEditorProps = {
  newItem?: boolean;
};

const ContentItemEditor = ({ newItem }: ContentItemEditorProps) => {
  const setPlaylistContent = useSetAtom(atomPlaylistPanelContent);
  const { addItem: addPlaylistItem } = usePlaylist();
  const preview = usePreview();

  const [title, setTitle] = useState('');
  const [stringContent, setStringContent] = useState('');
  const [content, setContent] = useState<ParsedContentLine[]>([]);
  const [selectedContentLineIndex, setSelectedContentLineIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useAtom(atomPlaylistSelectedItem);

  // Set form initial value
  useEffect(() => {
    if (!newItem && selectedItem) {
      setTitle(selectedItem.title);
      setStringContent(
        selectedItem.content.map((line) => line.text).join('\n\n'),
      );
    }
  }, [newItem]);

  // Parse content when change
  useEffect(() => {
    setContent(parseItemContent(stringContent, true));
  }, [stringContent]);

  // Handle Preview
  useEffect(() => {
    preview.show({ title, content: content }, selectedContentLineIndex);
  }, [title, content, selectedContentLineIndex]);

  const closeEditorHandler = () => setPlaylistContent('list');

  const onTextAreaCursorMoveHandler = (
    event:
      | React.MouseEvent<HTMLTextAreaElement, MouseEvent>
      | React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    const cursorLineIndexPos =
      stringContent.substring(0, event.currentTarget.selectionStart).split('\n')
        .length - 1;

    setSelectedContentLineIndex(
      content.findIndex((line) => line.indexs?.includes(cursorLineIndexPos)),
    );
  };

  const onSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newItem && selectedItem) {
      setSelectedItem({ ...selectedItem, title, content });
    } else {
      // if new item
      addPlaylistItem({ title, content });
    }

    closeEditorHandler();
  };

  return (
    <>
      <BasePanelHeader sub>
        <Title size="h6" weight="normal">
          {newItem ? 'Add new item' : 'Edit item'}
        </Title>
      </BasePanelHeader>

      <Box component="form" onSubmit={onSubmitHandler} sx={{ flexGrow: 1 }}>
        <Stack p="sm" spacing="xs" h="100%">
          <TextInput
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            label="Content"
            value={stringContent}
            onChange={(e) => setStringContent(e.target.value)}
            onKeyUp={onTextAreaCursorMoveHandler}
            onMouseUp={onTextAreaCursorMoveHandler}
            styles={{
              root: {
                flexGrow: 1,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              },
              wrapper: { flexGrow: 1 },
              input: { height: '100%', padding: '4px 8px', lineHeight: '1rem' },
            }}
            spellCheck="false"
          />

          <Group spacing="xs">
            <Button size="xs" color="gray" onClick={closeEditorHandler}>
              Cancel
            </Button>
            <Button size="xs" color="blue" type="submit">
              Save
            </Button>
          </Group>
        </Stack>
      </Box>
    </>
  );
};

export default ContentItemEditor;
