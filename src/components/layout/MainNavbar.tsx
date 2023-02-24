import { Button, Divider, Image, Navbar, Stack, Tooltip } from '@mantine/core';
import {
  IconDownload,
  IconInfoCircle,
  IconMusic,
  IconPlayerPlayFilled,
  IconSettings,
  IconUpload,
} from '@tabler/icons-react';

type NavItemProps = {
  title: string;
  icon: React.ReactNode;
  onClick?: () => void;
};
const NavItem = ({ title, icon, ...rest }: NavItemProps) => (
  <Tooltip label={title} position="right">
    <Button
      title={title}
      variant="light"
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

const MainNavbar = () => (
  <Navbar width={{ base: 51 }}>
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
        <NavItem title="Playlist" icon={<IconPlayerPlayFilled size={18} />} />

        <NavItem title="Song database" icon={<IconMusic size={18} />} />
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

export default MainNavbar;
