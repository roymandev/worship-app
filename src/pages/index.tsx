import { useAtomValue } from 'jotai';
import type { NextPage } from 'next';
import Head from 'next/head';
import AppBody from '../components/AppBody';
import ClientOnly from '../components/ClientOnly';
import { atomPlaylistName } from '../stores/playlistStore';

const Home: NextPage = () => {
  const playlistName = useAtomValue(atomPlaylistName);

  return (
    <>
      <Head>
        <title>{playlistName || 'Untitled'} - Worship App</title>
      </Head>
      <ClientOnly>
        <div className="flex overflow-hidden h-screen text-sm text-slate-700 bg-slate-300">
          <AppBody />
        </div>
      </ClientOnly>
    </>
  );
};

export default Home;
