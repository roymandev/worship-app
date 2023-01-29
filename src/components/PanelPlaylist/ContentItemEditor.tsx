import BaseInput from '@/components/BaseInput';
import BasePanelHeader from '@/components/BasePanelHeader';
import Button from '@/components/Button';
import usePlaylist from '@/hooks/usePlaylist';
import usePreview from '@/hooks/usePreview';
import { ParsedContentLine, parseItemContent } from '@/lib/parseItemContent';
import {
  atomPlaylistPanelContent,
  atomPlaylistSelectedItem,
} from '@/stores/playlistStore';
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
        <h3 className="px-1">Edit Item</h3>
      </BasePanelHeader>

      <form
        className="flex flex-1 flex-col gap-1 p-1"
        onSubmit={onSubmitHandler}
      >
        <BaseInput
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="flex-1 resize-none rounded border border-zinc-600 bg-transparent p-1 outline-none placeholder:text-zinc-500 focus:border-sky-500"
          spellCheck="false"
          placeholder="Content"
          value={stringContent}
          onChange={(e) => setStringContent(e.target.value)}
          onKeyUp={onTextAreaCursorMoveHandler}
          onMouseUp={onTextAreaCursorMoveHandler}
        />

        <div className="flex justify-end gap-1">
          <Button onClick={closeEditorHandler}>Cancel</Button>
          <Button color="blue" type="submit">
            Save
          </Button>
        </div>
      </form>
    </>
  );
};

export default ContentItemEditor;
