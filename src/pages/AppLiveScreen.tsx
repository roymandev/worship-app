import Screen from '@/components/Screen';
import { scaleScreen } from '@/lib/scaleScreen';
import { liveStore } from '@/stores/liveStore';
import { BASE_SCREEN_SETTINGS, screenStore } from '@/stores/screenStore';
import { Flex } from '@mantine/core';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';

const AppLiveScreen = () => {
  const selectedLine = useAtomValue(liveStore.selectedLine);
  const screenSettings = useAtomValue(screenStore.settings);
  const setScreenSizes = useSetAtom(screenStore.updateSizes);

  const resizeHandler = () => {
    const containerSizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    setScreenSizes({
      ...scaleScreen(BASE_SCREEN_SETTINGS.sizes, containerSizes).scaledSize,
      ...containerSizes,
    });
  };

  // Resize screen on mounted and on window resize
  useEffect(() => {
    resizeHandler();

    window.addEventListener('resize', resizeHandler);
    return () => window.removeEventListener('resize', resizeHandler);
  }, []);

  return (
    <Flex sx={{ position: 'fixed', inset: 0 }}>
      <Screen
        line={selectedLine}
        options={{
          hideText: screenSettings.hideText,
          hideScreen: screenSettings.hideScreen,
        }}
      />
    </Flex>
  );
};

export default AppLiveScreen;
