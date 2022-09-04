import { auth } from '@/lib/firebase';
import { atomCurrentUser } from '@/stores/adminStore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useSetAtom } from 'jotai';

const useAuth = () => {
  const setCurrentUser = useSetAtom(atomCurrentUser);

  const login = (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        setCurrentUser(userCredential.user);
        return userCredential;
      })
      .catch(() => setCurrentUser(null));

  return {
    login,
  };
};

export default useAuth;
