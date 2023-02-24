import { ScreenRef } from '@/components/Screen';
import { useEffect, useRef } from 'react';
import { Flex, AppShell } from '@mantine/core';
import MainNavbar from '@/components/layout/MainNavbar';

const Home = () => {
  const panelPreviewScreenRef = useRef<ScreenRef | null>(null);
  const panelLiveScreenRef = useRef<ScreenRef | null>(null);

  const dragHandler = () => {
    panelPreviewScreenRef.current?.resizeScreen();
    panelLiveScreenRef.current?.resizeScreen();
  };

  useEffect(() => {
    window.addEventListener('resize', dragHandler);
    return () => window.removeEventListener('resize', dragHandler);
  }, []);

  return (
    <Flex>
      <AppShell padding={0} navbar={<MainNavbar />}>
        content
      </AppShell>
    </Flex>
  );
};

export default Home;
