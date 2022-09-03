import Screen from '@/components/Screen';
import { scaleScreen } from '@/lib/scaleScreen';
import { atomLiveItemContentSelectedLine } from '@/stores/liveStore';
import { atomScreenMainSize, atomScreenSettings } from '@/stores/screenStore';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';

const LiveScreen = () => {
  const selectedLine = useAtomValue(atomLiveItemContentSelectedLine);
  const screenSettings = useAtomValue(atomScreenSettings);
  const setScreenMainSize = useSetAtom(atomScreenMainSize);

  // Resize main screen size based on screen size
  const resizeHandler = () => {
    const containerSize = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    setScreenMainSize({
      ...scaleScreen(screenSettings.baseSize, containerSize).scaledSize,
      ...containerSize,
    });
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
