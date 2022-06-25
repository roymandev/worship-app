import { useAtomValue } from 'jotai';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useRef } from 'react';
import ClientOnly from '../components/ClientOnly';
import TextScreen, { TextScreenRef } from '../components/TextScreen';
import {
  atomLiveHideScreen,
  atomLiveHideText,
  atomLiveItemContentSelectedLine,
} from '../stores/liveStore';

const Screen: NextPage = () => {
  const liveHideScreen = useAtomValue(atomLiveHideScreen);
  const liveHideText = useAtomValue(atomLiveHideText);
  const liveItemContentSelectedLine = useAtomValue(
    atomLiveItemContentSelectedLine,
  );

  const textScreenRef = useRef<TextScreenRef | null>(null);

  const scaleMainScreen = () => textScreenRef.current?.scaleMainScreen?.();

  useEffect(() => {
    window.addEventListener('resize', scaleMainScreen);
    return () => window.removeEventListener('resize', scaleMainScreen);
  }, [scaleMainScreen]);

  return (
    <>
      <Head>
        <title>Main Screen - Worship App</title>
      </Head>
      <ClientOnly>
        <div className="h-screen">
          <TextScreen
            ref={textScreenRef}
            line={liveHideText ? null : liveItemContentSelectedLine}
            hideScreen={liveHideScreen}
            mainScreen
          />
        </div>
      </ClientOnly>
    </>
  );
};

export default Screen;
