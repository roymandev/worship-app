import {
  atomLiveItem,
  atomLiveItemContentSelectedLineIndex,
} from '@/stores/liveStore';
import { useAtom } from 'jotai';

const useLive = () => {
  const [item, setItem] = useAtom(atomLiveItem);
  const [selectedLineIndex, setSelectedLineIndex] = useAtom(
    atomLiveItemContentSelectedLineIndex,
  );

  const show = (newItem: typeof item, lineIndex = 0) => {
    setItem(newItem);
    setSelectedLineIndex(newItem?.content[0] ? lineIndex : -1);
  };

  return { item, show, selectedLineIndex, setSelectedLineIndex };
};

export default useLive;
