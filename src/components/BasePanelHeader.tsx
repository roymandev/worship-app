import { Divider, Group, GroupProps, packSx } from '@mantine/core';

type BasePanelHeaderProps = GroupProps & {
  sub?: boolean;
};

const BasePanelHeader = ({ sub, sx, ...rest }: BasePanelHeaderProps) => {
  return (
    <>
      <Group
        px="xs"
        spacing="xs"
        sx={[
          (theme) => ({
            backgroundColor: sub ? theme.colors.dark[8] : 'inherit',
          }),
          ...packSx(sx),
        ]}
        h={36}
        {...rest}
      />
      <Divider />
    </>
  );
};

export default BasePanelHeader;
