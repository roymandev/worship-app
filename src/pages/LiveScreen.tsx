import Screen from '@/components/Screen';
import { scaleScreen } from '@/lib/scaleScreen';
import { atomLiveItemContentSelectedLine } from '@/stores/liveStore';
import { atomScreenSettings, SCREEN_BASE_SIZE } from '@/stores/screenStore';
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
    <div className="fixed inset-0 flex">
      <Screen
        line={selectedLine}
        options={{
          hideText: screenSettings.hideText,
          hideScreen: screenSettings.hideScreen,
        }}
      />
    </div>
  );
};

export default LiveScreen;
