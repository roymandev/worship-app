import BaseInput from '@/components/BaseInput';
import BasePanelHeader from '@/components/BasePanelHeader';
import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import usePlaylist from '@/components/hooks/usePlaylist';
import { parseItemContent } from '@/lib/parseItemContent';
import {
  atomPlaylistPanelContent,
  atomPlaylistSelectedItem,
} from '@/stores/playlistStore';
import {
  atomPreviewItem,
  atomPreviewItemContentSelectedLineIndex,
} from '@/stores/previewStore';
import { PlaylistItem } from '@/types';
import { useAtom, useSetAtom } from 'jotai';
import { nanoid } from 'nanoid';
import { useEffect, useId, useState } from 'react';

interface ItemEdit extends Omit<PlaylistItem, 'content'> {
  content: string;
}

export interface ContentItemEditorProps {
  addItem?: boolean;
}

const ContentItemEditor = ({ addItem }: ContentItemEditorProps) => {
  const formId = useId();
  const setPanelContent = useSetAtom(atomPlaylistPanelContent);
  const setPreviewItem = useSetAtom(atomPreviewItem);
  const setPreviewItemContentSelectedLineIndex = useSetAtom(
    atomPreviewItemContentSelectedLineIndex,
  );

  const { setItems, setSelectedItemId } = usePlaylist();
  const [selectedItem, setSelectedItem] = useAtom(atomPlaylistSelectedItem);

  const [currentItem, setCurrentItem] = useState<ItemEdit>({
    id: nanoid(),
    title: '',
    content: '',
  });

  useEffect(() => {
    if (selectedItem && !addItem) {
      setCurrentItem({
        ...selectedItem,
        content: selectedItem.content.map((line) => line.text).join('\n\n'),
      });
    }
  }, [selectedItem]);

  // Show Preview
  useEffect(() => {
    setPreviewItem({
      title: currentItem.title,
      content: parseItemContent(currentItem.content),
    });
  }, [currentItem]);

  // Show preview content selected line index when textarea cursor move
  const onTextAreaCursorMoveHandler = (
    event:
      | React.MouseEvent<HTMLTextAreaElement, MouseEvent>
      | React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    const cursorLineIndexPos =
      event.currentTarget.value
        .substring(0, event.currentTarget.selectionStart)
        .split('\n').length - 1;

    setPreviewItemContentSelectedLineIndex(
      parseItemContent(event.currentTarget.value, true).findIndex((line) =>
        line.indexs?.includes(cursorLineIndexPos),
      ),
    );
  };

  const onSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const newItem = {
      ...currentItem,
      title: currentItem.title || 'Untitled',
      content: parseItemContent(currentItem.content),
    };
    if (addItem) {
      setItems((prevItems) => [...prevItems, newItem]);
      setSelectedItemId(newItem.id);
    } else {
      if (selectedItem) setSelectedItem(newItem);
    }

    setPanelContent('list');
  };

  return (
    <>
      <BasePanelHeader sub>
        <h2 className="px-1">{addItem ? 'Add item' : 'Edit item'}</h2>
      </BasePanelHeader>

      <form
        onSubmit={onSubmitHandler}
        className="flex flex-1 flex-col gap-1 p-1"
      >
        <fieldset className="flex items-center">
          <label htmlFor={formId + 'title'} className="w-14 px-1">
            Title
          </label>
          <BaseInput
            className="h-7 flex-1 px-1"
            id={formId + 'title'}
            value={currentItem.title}
            onChange={(event) =>
              setCurrentItem((prevValue) => ({
                ...prevValue,
                title: event.target.value,
              }))
            }
          />
        </fieldset>

        <fieldset className="flex items-center">
          <label htmlFor={formId + 'note'} className="w-14 px-1">
            Note
          </label>
          <BaseInput
            className="h-7 flex-1 px-1"
            id={formId + 'note'}
            value={currentItem.note}
            onChange={(event) =>
              setCurrentItem((prevValue) => ({
                ...prevValue,
                note: event.target.value,
              }))
            }
          />
        </fieldset>

        <textarea
          className="flex-1 resize-none rounded border border-slate-300 p-1 outline-none focus:border-blue-600"
          spellCheck="false"
          placeholder="Content"
          value={currentItem.content}
          onChange={(event) =>
            setCurrentItem((prevValue) => ({
              ...prevValue,
              content: event.target.value,
            }))
          }
          onKeyUp={onTextAreaCursorMoveHandler}
          onMouseUp={onTextAreaCursorMoveHandler}
        />

        <div className="flex justify-end gap-1">
          <ButtonPrimary color="blue" type="submit">
            Save
          </ButtonPrimary>
          <ButtonPrimary
            color="gray"
            onClick={() => {
              setPanelContent('list');
              setPreviewItem(selectedItem);
            }}
          >
            Cancel
          </ButtonPrimary>
        </div>
      </form>
    </>
  );
};

export default ContentItemEditor;
