import BaseListItem, { BaseListLineProps } from '@/components/BaseListItem';
import { BaseItemLine } from '@/schemas/itemSchema';
import { Text } from '@mantine/core';

interface ItemContentLineProps extends BaseListLineProps {
  line: BaseItemLine;
}

const lineColor: Record<string, string> = {
  verse: 'green.4',
  chorus: 'grape.3',
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
