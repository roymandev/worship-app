import { twMerge } from 'tailwind-merge';
import { BaseItemContentLine } from '../types/playlistTypes';
import BaseListLine from './BaseListLine';

interface ItemContentLineProps {
  line: BaseItemContentLine;
  isSelected: boolean;
  onClick: () => void;
}

const variantClass: Record<string, string> = {
  verse: 'text-green-600',
  chorus: 'text-purple-600',
  end: 'text-red-600',
};

const ItemContentLine = ({
  line,
  isSelected,
  onClick,
}: ItemContentLineProps) => {
  return (
    <BaseListLine
      className={twMerge('py-1.5 px-1', line.type && variantClass[line.type])}
      isSelected={isSelected}
      onClick={onClick}
    >
      {line.text}
    </BaseListLine>
  );
};

export default ItemContentLine;
