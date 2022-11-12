import BaseListItem, { BaseListLineProps } from '@/components/BaseListItem';
import { twclsx } from '@/lib/twclsx';
import { BaseItemContentLine } from '@/types';

interface ItemContentLineProps extends BaseListLineProps {
  line: BaseItemContentLine;
}

const lineClass: Record<string, string> = {
  verse: 'text-green-400',
  chorus: 'text-purple-400',
  end: 'text-red-400',
};

const ItemContentLine = ({
  line,
  isSelected,
  onClick,
  ...rest
}: ItemContentLineProps) => (
  <BaseListItem
    className={twclsx('py-1.5 px-1', line.type && lineClass[line.type])}
    isSelected={isSelected}
    onClick={onClick}
    {...rest}
  >
    {line.text}
  </BaseListItem>
);

export default ItemContentLine;
