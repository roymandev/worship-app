import {
  atomPreviewItem,
  atomPreviewItemContentSelectedLineIndex,
} from '@/stores/previewStore';
import { useAtom } from 'jotai';

const usePreview = () => {
  const [item, setItem] = useAtom(atomPreviewItem);
  const [selectedLineIndex, setSelectedLineIndex] = useAtom(
    atomPreviewItemContentSelectedLineIndex,
  );

  const show = (newItem: typeof item, lineIndex = 0) => {
    setItem(newItem);
    setSelectedLineIndex(newItem?.content[0] ? lineIndex : -1);
  };

  return { item, show, selectedLineIndex, setSelectedLineIndex };
};

export default usePreview;
