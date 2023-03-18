import LoadingFullscreen from '@/components/LoadingFullscreen';
import { MantineProvider } from '@mantine/core';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

const AppHome = lazy(() => import('@/pages/AppHome'));
const AppLiveScreen = lazy(() => import('@/pages/AppLiveScreen'));

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
          <Route index element={<AppHome />} />

          <Route path="/screen" element={<AppLiveScreen />} />
        </Routes>
      </Suspense>
    </MantineProvider>
  );
}

export default App;
