import { Grid, Image } from '@mantine/core';

const LoadingFullscreen = () => (
  <Grid justify="center" align="center" sx={{ position: 'fixed', inset: 0 }}>
    <Image
      src="/Worship%20App.svg"
      alt="My Notes Logo"
      width={100}
      height={100}
    />
  </Grid>
);

export default LoadingFullscreen;
