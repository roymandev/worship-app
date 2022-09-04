import Loading from '@/components/Fallback/Loading';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

const Home = lazy(() => import('@/pages/Home'));
const LiveScreen = lazy(() => import('@/pages/LiveScreen'));

function App() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 flex">
          <Loading />
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/screen" element={<LiveScreen />} />
      </Routes>
    </Suspense>
  );
}

export default App;
