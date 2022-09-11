import { auth } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import { useEffect, useState } from 'react';

const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(
    () =>
      onAuthStateChanged(auth, (user) => {
        setUser(user);
      }),
    [],
  );

  const login = (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        setUser(userCredential.user);
        return userCredential;
      })
      .catch((error) => console.log(error));

  const logout = () => signOut(auth);

  return {
    user,
    login,
    logout,
  };
};

export default useAuth;
