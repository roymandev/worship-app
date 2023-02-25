import { TextInput, TextInputProps } from '@mantine/core';

type BasePanelHeaderInputProps = Omit<TextInputProps, 'variant' | 'styles'>;

const BasePanelHeaderInput = ({ ...props }: BasePanelHeaderInputProps) => {
  return (
    <TextInput
      {...props}
      variant="unstyled"
      styles={(theme) => ({
        root: {
          flex: '1 1 0',
        },
        input: {
          padding: '0 10px',
          '&:hover': {
            color: theme.colors.dark[1],
            backgroundColor: theme.colors.dark[6],
          },
        },
      })}
    />
  );
};

export default BasePanelHeaderInput;
