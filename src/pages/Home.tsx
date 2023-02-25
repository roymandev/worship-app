import { ScreenRef } from '@/components/Screen';
import { useEffect, useRef } from 'react';
import { Flex, AppShell } from '@mantine/core';
import MainNavbar from '@/components/layout/MainNavbar';
import MainPanels from '@/components/layout/MainPanels';
import { NotificationsProvider } from '@mantine/notifications';

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
    <NotificationsProvider position="bottom-left">
      <Flex>
        <AppShell padding={0} navbar={<MainNavbar />}>
          <MainPanels />
        </AppShell>
      </Flex>
    </NotificationsProvider>
  );
};

export default Home;
