import BaseList from '@/components/BaseList';
import BaseListItem from '@/components/BaseListItem';
import useLive from '@/hooks/useLive';
import usePreview from '@/hooks/usePreview';
import {
  atomSongs,
  atomSongsSelectedSong,
  atomSongsSelectedSongId,
} from '@/stores/searchStore';
import { BaseItem } from '@/types';
import { useAtom, useAtomValue } from 'jotai';
import { useEffect } from 'react';

const ResultList = () => {
  const preview = usePreview();
  const live = useLive();

  const result = useAtomValue(atomSongs);
  const [selectedSongId, setSelectedSongId] = useAtom(atomSongsSelectedSongId);
  const selectedSong = useAtomValue(atomSongsSelectedSong);

  // Set Preview
  useEffect(() => {
    preview.show(selectedSong);
  }, [selectedSong]);

  return (
    <BaseList<BaseItem>
      items={result}
      selectedItemIndex={result.findIndex((item) => item.id === selectedSongId)}
      onSelectItem={(item) => setSelectedSongId(item.id)}
      onKeyDownEnter={() => live.show(selectedSong)}
      renderItem={(item, isSelected) => (
        <BaseListItem
          key={item.id}
          className="select-none py-1 px-2"
          isSelected={isSelected}
          onClick={() => setSelectedSongId(item.id)}
          onDoubleClick={() => live.show(item)}
        >
          <h3 className="font-medium">{item.title || '(Untitled)'}</h3>
        </BaseListItem>
      )}
    />
  );
};

export default ResultList;
