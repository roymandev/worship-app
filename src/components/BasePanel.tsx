import { Stack } from '@mantine/core';

export interface BasePanelProps {
  children: React.ReactNode;
  className?: string;
}

const BasePanel = ({ children }: BasePanelProps) => (
  <Stack sx={{ flex: '1 1 0%', overflow: 'hidden' }} spacing={0}>
    {children}
  </Stack>
);

export default BasePanel;
