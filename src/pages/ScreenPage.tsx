import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import TextScreen from '../components/TextScreen';
import { atomLiveItemSelectedLine } from '../stores/liveStore';
import { atomUpdateScreenSettings } from '../stores/screenStore';

const ScreenPage = () => {
  const liveItemSelectedLine = useAtomValue(atomLiveItemSelectedLine);
  const setScreenSettings = useSetAtom(atomUpdateScreenSettings);

  const resizeScreen = () => {
    setScreenSettings({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  useEffect(() => {
    resizeScreen();

    window.addEventListener('resize', resizeScreen);
    return () => window.removeEventListener('resize', resizeScreen);
  }, []);

  return (
    <div className="h-screen">
      <TextScreen line={liveItemSelectedLine} />
    </div>
  );
};

export default ScreenPage;
