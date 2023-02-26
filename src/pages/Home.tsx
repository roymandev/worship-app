import { Flex, AppShell } from '@mantine/core';
import MainNavbar from '@/components/layout/MainNavbar';
import MainPanels from '@/components/layout/MainPanels';
import { NotificationsProvider } from '@mantine/notifications';

const Home = () => {
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
