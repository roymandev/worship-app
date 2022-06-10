import { useAtomValue, useSetAtom } from 'jotai';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useEffect } from 'react';
import ClientOnly from '../components/ClientOnly';
import TextScreen from '../components/TextScreen';
import { atomLiveItemContentSelectedLine } from '../stores/liveStore';
import { atomUpdateScreenSettings } from '../stores/screenStore';

const Screen: NextPage = () => {
  const liveItemContentSelectedLine = useAtomValue(
    atomLiveItemContentSelectedLine,
  );
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
    <>
      <Head>
        <title>Screen - Worship App</title>
      </Head>
      <ClientOnly>
        <div className="h-screen">
          <TextScreen line={liveItemContentSelectedLine} />
        </div>
      </ClientOnly>
    </>
  );
};

export default Screen;
