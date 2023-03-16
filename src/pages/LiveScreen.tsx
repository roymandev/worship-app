import Screen from '@/components/Screen';
import { scaleScreen } from '@/lib/scaleScreen';
import { BASE_SCREEN_SETTINGS } from '@/schemas/screenSchema';
import { liveStore } from '@/stores/liveStore';
import { atomScreenSettings } from '@/stores/screenStore';
import { Flex } from '@mantine/core';
import { useAtom, useAtomValue } from 'jotai';
import { useEffect } from 'react';

const LiveScreen = () => {
  const selectedLine = useAtomValue(liveStore.selectedLine);
  const [screenSettings, setScreenSettings] = useAtom(atomScreenSettings);

  const resizeHandler = () => {
    const containerSizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    setScreenSettings((prevSettings) => ({
      ...prevSettings,
      mainSize: {
        ...scaleScreen(BASE_SCREEN_SETTINGS.mainSize, containerSizes)
          .scaledSize,
        ...containerSizes,
      },
    }));
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

export default LiveScreen;
