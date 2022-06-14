import { useEffect, useId, useState } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { nanoid } from 'nanoid';

import { parseContent } from '../../lib/parseContent';
import {
  atomPlaylistAddItem,
  atomPlaylistPanelContent,
  atomPlaylistSelectedItem,
} from '../../stores/playlistStore';
import {
  atomPreviewItem,
  atomPreviewItemContentSelectedLineIndex,
} from '../../stores/previewStore';

import BasePanelHeader from '../BasePanelHeader';
import BaseInput from '../BaseInput';
import ButtonDefault from '../Buttons/ButtonDefault';

interface PanelPlaylistItemEditorProps {
  addItem?: boolean;
}

const PanelPlaylistItemEditor = ({ addItem }: PanelPlaylistItemEditorProps) => {
  const setPlaylistPanelContent = useSetAtom(atomPlaylistPanelContent);
  const setPlaylistAddItem = useSetAtom(atomPlaylistAddItem);
  const [playlistSelectedItem, setPlaylistSelectedItem] = useAtom(
    atomPlaylistSelectedItem,
  );
  const setPreviewItem = useSetAtom(atomPreviewItem);
  const setPreviewContentSelectedLineIndex = useSetAtom(
    atomPreviewItemContentSelectedLineIndex,
  );

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [note, setNote] = useState('');

  // set current title & content to playlist selected item
  useEffect(() => {
    if (playlistSelectedItem && !addItem) {
      setTitle(playlistSelectedItem.title);
      setContent(
        playlistSelectedItem?.content.map((line) => line.text).join('\n\n'),
      );
      setNote(playlistSelectedItem.note ?? '');
    }
  }, [playlistSelectedItem]);

  // Set Preview
  useEffect(() => {
    setPreviewItem({
      title,
      content: parseContent(content, true),
    });
  }, [title, content]);

  // Set preview content selected line index when textarea cursor move
  const onTextAreaCursorMove = (
    event:
      | React.MouseEvent<HTMLTextAreaElement, MouseEvent>
      | React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    const cursorLineIndexPos =
      event.currentTarget.value
        .substring(0, event.currentTarget.selectionStart)
        .split('\n').length - 1;

    setPreviewContentSelectedLineIndex(
      parseContent(event.currentTarget.value).findIndex((line) =>
        line.indexs?.includes(cursorLineIndexPos),
      ),
    );
  };

  // On editor save
  const saveHandler = () => {
    const newItem = {
      title: title ? title : 'Untitled',
      content: parseContent(content, true),
      note: note,
    };
    if (addItem) {
      setPlaylistAddItem({ ...newItem, id: nanoid() });
    } else {
      if (playlistSelectedItem) {
        setPlaylistSelectedItem({
          ...playlistSelectedItem,
          ...newItem,
        });
      }
    }
    closeEditor();
  };

  const closeEditor = () => setPlaylistPanelContent('list');
  const titleId = useId();
  const noteId = useId();

  return (
    <>
      <BasePanelHeader sub>
        <h3 className="px-2">{addItem ? 'Add Item' : 'Edit Item'}</h3>
      </BasePanelHeader>

      <div className="flex flex-col flex-1 gap-1 p-1">
        <div className="flex gap-2 items-center pl-1">
          <label htmlFor={titleId} className="w-10">
            Title
          </label>
          <BaseInput
            className="flex-1 px-1 h-7"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            id={titleId}
          />
        </div>

        <div className="flex gap-2 items-center pl-1">
          <label htmlFor={noteId} className="w-10">
            Note
          </label>
          <BaseInput
            className="flex-1 px-1 h-7"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            id={noteId}
          />
        </div>

        <textarea
          className="flex-1 p-1 rounded border border-slate-300 focus:border-blue-600 outline-none resize-none"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyUp={onTextAreaCursorMove}
          onMouseUp={onTextAreaCursorMove}
          spellCheck="false"
        />

        <div className="flex gap-1">
          <ButtonDefault color="blue" className="ml-auto" onClick={saveHandler}>
            Save
          </ButtonDefault>

          <ButtonDefault color="gray" onClick={closeEditor}>
            Cancel
          </ButtonDefault>
        </div>
      </div>
    </>
  );
};

export default PanelPlaylistItemEditor;
