import FullScreenLoading from '@/components/Fallback/FullScreenLoading';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

const Home = lazy(() => import('@/pages/Home'));
const LiveScreen = lazy(() => import('@/pages/LiveScreen'));
const Login = lazy(() => import('@/pages/Login'));

function App() {
  return (
    <Suspense fallback={<FullScreenLoading />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/screen" element={<LiveScreen />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Suspense>
  );
}

export default App;
