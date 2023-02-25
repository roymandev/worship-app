import { atomLeftPanelContent } from '@/stores/layoutStore';
import { Button, Divider, Image, Navbar, Stack, Tooltip } from '@mantine/core';
import {
  IconDownload,
  IconInfoCircle,
  IconListCheck,
  IconMusic,
  IconSettings,
  IconUpload,
} from '@tabler/icons-react';
import { useAtom } from 'jotai';

type NavItemProps = {
  title: string;
  icon: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
};
const NavItem = ({ title, icon, isActive, ...rest }: NavItemProps) => (
  <Tooltip label={title} position="right">
    <Button
      title={title}
      variant={isActive ? 'filled' : 'light'}
      sx={(theme) => ({ '&:hover': { backgroundColor: theme.colors.gray[8] } })}
      color="gray"
      w={34}
      h={34}
      p={0}
      {...rest}
    >
      {icon}
    </Button>
  </Tooltip>
);

const MainNavbar = () => {
  const [leftPanelContent, setLeftPanelContent] = useAtom(atomLeftPanelContent);

  return (
    <Navbar
      width={{ base: 51 }}
      sx={(theme) => ({ borderColor: theme.colors.dark[4] })}
    >
      <Navbar.Section p={8}>
        <Image
          src="/Worship%20App.svg"
          alt="Worship App Logo"
          height={34}
          width={34}
        />
      </Navbar.Section>

      <Divider />

      <Navbar.Section grow>
        <Stack align="center" p={8} spacing={8}>
          <NavItem
            title="Playlist"
            icon={<IconListCheck size={18} />}
            isActive={leftPanelContent === 'playlist'}
            onClick={() => setLeftPanelContent('playlist')}
          />

          <NavItem
            title="Song database"
            icon={<IconMusic size={18} />}
            isActive={leftPanelContent === 'song-database'}
            onClick={() => setLeftPanelContent('song-database')}
          />
        </Stack>
      </Navbar.Section>

      <Divider />

      <Navbar.Section>
        <Stack align="center" p={8} spacing={8}>
          <NavItem title="Import playlist" icon={<IconUpload size={18} />} />
          <NavItem title="Export playlist" icon={<IconDownload size={18} />} />
        </Stack>
      </Navbar.Section>

      <Divider />

      <Navbar.Section>
        <Stack align="center" p={8} spacing={8}>
          <NavItem title="Settings" icon={<IconSettings size={18} />} />
          <NavItem title="About" icon={<IconInfoCircle size={18} />} />
        </Stack>
      </Navbar.Section>
    </Navbar>
  );
};

export default MainNavbar;
