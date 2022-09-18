import AuthRoutes from '@/components/Auth/AuthRoutes';
import LoadingFullscreen from '@/components/Fallback/LoadingFullscreen';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

const Home = lazy(() => import('@/pages/Home'));
const LiveScreen = lazy(() => import('@/pages/LiveScreen'));
const Login = lazy(() => import('@/pages/Login'));

function App() {
  return (
    <Suspense fallback={<LoadingFullscreen />}>
      <Routes>
        <Route path="/" element={<AuthRoutes />}>
          <Route index element={<Home />} />
          <Route path="/login" element={<Login />} />
        </Route>

        <Route path="/screen" element={<LiveScreen />} />
      </Routes>
    </Suspense>
  );
}

export default App;
