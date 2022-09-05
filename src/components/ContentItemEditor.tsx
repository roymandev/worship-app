import BaseInput from '@/components/BaseInput';
import BasePanelHeader from '@/components/BasePanelHeader';
import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import { parseItemContent } from '@/lib/parseItemContent';
import {
  atomPreviewItem,
  atomPreviewItemContentSelectedLineIndex,
} from '@/stores/previewStore';
import { BaseItem } from '@/types';
import { useSetAtom } from 'jotai';
import { useEffect, useId, useState } from 'react';

interface Item extends BaseItem {
  note?: string;
}

export interface ContentItemEditorProps {
  title?: string;
  item: Item;
  onSubmit: (item: Item) => void;
  onCancel: () => void;
}

const ContentItemEditor = ({
  title = 'ItemEditor',
  onSubmit,
  item,
  onCancel,
}: ContentItemEditorProps) => {
  const formId = useId();
  const [currentItem, setItem] = useState({
    ...item,
    content: item.content.map((line) => line.text).join('\n\n'),
  });

  const setPreviewItem = useSetAtom(atomPreviewItem);
  const setPreviewItemContentSelectedLineIndex = useSetAtom(
    atomPreviewItemContentSelectedLineIndex,
  );

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
    onSubmit({
      ...currentItem,
      title: currentItem.title || 'Untitled',
      content: parseItemContent(currentItem.content),
    });
  };

  return (
    <>
      <BasePanelHeader sub>
        <h2 className="px-1">{title}</h2>
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
              setItem((prevValue) => ({
                ...prevValue,
                title: event.target.value,
              }))
            }
          />
        </fieldset>

        {currentItem.note || (
          <fieldset className="flex items-center">
            <label htmlFor={formId + 'note'} className="w-14 px-1">
              Note
            </label>
            <BaseInput
              className="h-7 flex-1 px-1"
              id={formId + 'note'}
              value={currentItem.note}
              onChange={(event) =>
                setItem((prevValue) => ({
                  ...prevValue,
                  note: event.target.value,
                }))
              }
            />
          </fieldset>
        )}

        <textarea
          className="flex-1 resize-none rounded border border-slate-300 p-1 outline-none focus:border-blue-600"
          spellCheck="false"
          placeholder="Content"
          value={currentItem.content}
          onChange={(event) =>
            setItem((prevValue) => ({
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
          <ButtonPrimary color="gray" onClick={onCancel}>
            Cancel
          </ButtonPrimary>
        </div>
      </form>
    </>
  );
};

export default ContentItemEditor;
