import Screen from '@/components/Screen';
import { scaleScreen } from '@/lib/scaleScreen';
import { atomLiveItemContentSelectedLine } from '@/stores/liveStore';
import { atomScreenSettings, SCREEN_BASE_SIZE } from '@/stores/screenStore';
import { Flex } from '@mantine/core';
import { useAtom, useAtomValue } from 'jotai';
import { useEffect } from 'react';

const LiveScreen = () => {
  const selectedLine = useAtomValue(atomLiveItemContentSelectedLine);
  const [screenSettings, setScreenSettings] = useAtom(atomScreenSettings);

  const resizeHandler = () => {
    const containerSizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    setScreenSettings((prevSettings) => ({
      ...prevSettings,
      mainSize: {
        ...scaleScreen(SCREEN_BASE_SIZE, containerSizes).scaledSize,
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
