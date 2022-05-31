import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { playlistSelectedItemAtom } from '../stores/playlistStore';
import BaseList from './BaseList';
import BasePanel from './BasePanel';
import BasePanelHeader from './BasePanelHeader';
import ItemContentLine from './ItemContentLine';

const PanelPreview = () => {
  const playlistSelectedItem = useAtomValue(playlistSelectedItemAtom);
  const [selectedLineIndex, setSelectedLineIndex] = useState(-1);

  useEffect(() => {
    setSelectedLineIndex(playlistSelectedItem?.content[0] ? 0 : -1);
  }, [playlistSelectedItem]);

  return (
    <BasePanel>
      <BasePanelHeader>
        <h2 className="px-2">Preview</h2>
      </BasePanelHeader>
      <BasePanelHeader sub>
        <h2 className="px-2">{playlistSelectedItem?.title}</h2>
      </BasePanelHeader>
      <BaseList
        className="leading-4 whitespace-pre-line"
        items={playlistSelectedItem?.content ?? []}
        scrollToIndex={selectedLineIndex}
        renderItem={(line, index) => (
          <ItemContentLine
            key={index}
            line={line}
            isSelected={index === selectedLineIndex}
            onClick={() => setSelectedLineIndex(index)}
          />
        )}
      />
    </BasePanel>
  );
};

export default PanelPreview;
