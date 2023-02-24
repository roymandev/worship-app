import LoadingFullscreen from '@/components/Fallback/LoadingFullscreen';
import { MantineProvider } from '@mantine/core';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

const Home = lazy(() => import('@/pages/Home'));
const LiveScreen = lazy(() => import('@/pages/LiveScreen'));

function App() {
  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{
        fontFamily: 'Outfit, sans-serif',
        colorScheme: 'dark',
        headings: {
          fontFamily: 'Outfit, sans-serif',
        },
      }}
    >
      <Suspense fallback={<LoadingFullscreen />}>
        <Routes>
          <Route index element={<Home />} />

          <Route path="/screen" element={<LiveScreen />} />
        </Routes>
      </Suspense>
    </MantineProvider>
  );
}

export default App;
