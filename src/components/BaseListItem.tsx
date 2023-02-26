import { packSx, UnstyledButton, UnstyledButtonProps } from '@mantine/core';
import { useEventListener, useMergedRef } from '@mantine/hooks';

export type BaseListLineProps = UnstyledButtonProps & {
  isSelected: boolean;
  onClick?: (event: MouseEvent) => void;
  onDoubleClick?: (event: MouseEvent) => void;
};

const BaseListItem = ({
  isSelected,
  sx,
  onClick,
  onDoubleClick,
  ...rest
}: BaseListLineProps) => {
  const onClickRef = useEventListener('click', (e) => onClick?.(e));
  const onDoubleClickRef = useEventListener('click', (e) => onDoubleClick?.(e));
  const mergedRef = useMergedRef(onClickRef, onDoubleClickRef);

  return (
    <UnstyledButton
      ref={mergedRef}
      sx={[
        {
          padding: '4px 8px',
        },
        isSelected
          ? (theme) => ({
              color: 'white',
              backgroundColor: theme.colors.blue[8],
            })
          : (theme) => ({
              '&:hover': {
                backgroundColor: theme.colors.dark[6],
              },
            }),
        ...packSx(sx),
      ]}
      {...rest}
    />
  );
};

export default BaseListItem;
