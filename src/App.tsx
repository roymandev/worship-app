import LoadingFullscreen from '@/components/Fallback/LoadingFullscreen';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

const Home = lazy(() => import('@/pages/Home'));
const LiveScreen = lazy(() => import('@/pages/LiveScreen'));

function App() {
  return (
    <Suspense fallback={<LoadingFullscreen />}>
      <Routes>
        <Route index element={<Home />} />

        <Route path="/screen" element={<LiveScreen />} />
      </Routes>
    </Suspense>
  );
}

export default App;
