import { useAtom } from 'jotai';
import BasePanelHeader from './BasePanelHeader';
import { PanelPlaylistBody } from './PanelPlaylist';
import { atomPlaylistSelectedItem } from '../stores/playlistStore';
import { useEffect, useId, useState } from 'react';
import BaseInput from './BaseInput';
import BaseButton from './BaseButton';
import { parseContent } from '../lib/parseContent';

interface PanelPlaylistItemEditorProps {
  setPanelBody: (panelName: PanelPlaylistBody) => void;
}
const PanelPlaylistItemEditor = ({
  setPanelBody,
}: PanelPlaylistItemEditorProps) => {
  const [playlistSelectedItem, setPlaylistSelectedItem] = useAtom(
    atomPlaylistSelectedItem,
  );
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (playlistSelectedItem) {
      setTitle(playlistSelectedItem.title);
      setContent(
        playlistSelectedItem?.content.map((line) => line.text).join('\n\n'),
      );
    }
  }, [playlistSelectedItem]);

  const saveHandler = () => {
    if (playlistSelectedItem) {
      setPlaylistSelectedItem({
        ...playlistSelectedItem,
        title: title,
        content: parseContent(content),
      });
      closeEditor();
    }
  };

  const closeEditor = () => setPanelBody('list');
  const titleId = useId();

  return (
    <>
      <BasePanelHeader sub>
        <h3 className="px-2">Item Editor</h3>
      </BasePanelHeader>
      <div className="flex flex-col flex-1 gap-1 p-1">
        <div className="flex gap-2 items-center pl-1">
          <label htmlFor={titleId}>Title</label>
          <BaseInput
            className="flex-1 px-1 h-7"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            id={titleId}
          />
        </div>
        <textarea
          className="flex-1 p-1 rounded border border-slate-300 focus:border-blue-400 outline-none resize-none"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          spellCheck="false"
        />
        <div className="flex gap-1">
          <BaseButton
            variant="primary"
            className="py-1 px-3 ml-auto"
            onClick={saveHandler}
          >
            Save
          </BaseButton>
          <BaseButton
            variant="default"
            className="py-1 px-3"
            onClick={closeEditor}
          >
            Cancel
          </BaseButton>
        </div>
      </div>
    </>
  );
};

export default PanelPlaylistItemEditor;
