import Loading from '@/components/Fallback/Loading';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

const Home = lazy(() => import('@/pages/Home'));

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
      </Routes>
    </Suspense>
  );
}

export default App;
