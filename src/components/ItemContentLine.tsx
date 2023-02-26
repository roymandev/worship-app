import BaseListItem, { BaseListLineProps } from '@/components/BaseListItem';
import { BaseItemContentLine } from '@/types';
import { Text } from '@mantine/core';

interface ItemContentLineProps extends BaseListLineProps {
  line: BaseItemContentLine;
}

const lineColor: Record<string, string> = {
  verse: 'green.4',
  chorus: 'grape.4',
  end: 'red.5',
};

const ItemContentLine = ({
  line,
  isSelected,
  onClick,
  ...rest
}: ItemContentLineProps) => (
  <BaseListItem isSelected={isSelected} onClick={onClick} {...rest}>
    <Text
      fz={14}
      lh="inherit"
      fw="normal"
      color={line.type && lineColor[line.type]}
    >
      {line.text}
    </Text>
  </BaseListItem>
);

export default ItemContentLine;
