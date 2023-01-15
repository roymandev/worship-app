import BaseInput from '@/components/BaseInput';
import BasePanelHeader from '@/components/BasePanelHeader';
import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import usePreview from '@/hooks/usePreview';
import { ParsedContentLine, parseItemContent } from '@/lib/parseItemContent';
import {
  atomPlaylistItems,
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
  const setPlaylistItems = useSetAtom(atomPlaylistItems);
  const preview = usePreview();

  const [id, setId] = useState(crypto.randomUUID());
  const [title, setTitle] = useState('');
  const [stringContent, setStringContent] = useState('');
  const [content, setContent] = useState<ParsedContentLine[]>([]);
  const [selectedContentLineIndex, setSelectedContentLineIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useAtom(atomPlaylistSelectedItem);

  // Set form initial value
  useEffect(() => {
    if (!newItem && selectedItem) {
      setId(selectedItem.id);
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
      setSelectedItem({ id, title, content });
    } else {
      // if new item
      setPlaylistItems((prevItems) => [...prevItems, { id, title, content }]);
    }

    closeEditorHandler();
  };

  return (
    <>
      <BasePanelHeader sub>Edit Item</BasePanelHeader>

      <form className="flex flex-1 flex-col p-1" onSubmit={onSubmitHandler}>
        <div className="flex flex-1 flex-col gap-1 p-1">
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
        </div>
        <div className="flex justify-end gap-1">
          <ButtonPrimary onClick={closeEditorHandler}>Cancel</ButtonPrimary>
          <ButtonPrimary type="submit">Save</ButtonPrimary>
        </div>
      </form>
    </>
  );
};

export default ContentItemEditor;
