import LoadingFullscreen from '@/components/Fallback/LoadingFullscreen';
import { auth } from '@/lib/firebase';
import { atomUser } from '@/stores/userStore';
import { onAuthStateChanged } from 'firebase/auth';
import { useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';

const AuthRoutes = () => {
  const setUser = useSetAtom(atomUser);
  const [loading, setLoading] = useState(true);

  useEffect(
    () =>
      onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
      }),
    [],
  );

  if (loading) return <LoadingFullscreen />;

  return <Outlet />;
};

export default AuthRoutes;
