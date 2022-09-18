import BaseInput from '@/components/BaseInput';
import BasePanel from '@/components/BasePanel';
import BasePanelHeader from '@/components/BasePanelHeader';
import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import LoadingFullscreen from '@/components/Fallback/LoadingFullscreen';
import { auth } from '@/lib/firebase';
import { atomUser } from '@/stores/userStore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAtom } from 'jotai';
import { useId, useState } from 'react';
import { Navigate } from 'react-router-dom';

const Login = () => {
  const [user, setUser] = useAtom(atomUser);
  const formId = useId();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => setUser(userCredential.user))
      .catch((error) => console.log(error))
      .finally(() => setLoading(false));
  };

  if (loading) return <LoadingFullscreen />;

  if (user) return <Navigate to="/" replace />;

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-300 text-slate-700">
      <div>
        <h1 className="px-4 py-6 text-center text-4xl font-bold">
          Worship App
        </h1>
        <BasePanel>
          <BasePanelHeader>
            <h2 className="mx-auto px-1 font-medium">Login</h2>
          </BasePanelHeader>

          <form className="p-4" onSubmit={onSubmitHandler}>
            <fieldset className="mb-4 flex flex-col gap-1">
              <label htmlFor={formId + 'email'}>Email</label>
              <BaseInput
                className="flex-1 py-1 px-2"
                id={formId + 'email'}
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </fieldset>

            <fieldset className="mb-6 flex flex-col gap-1">
              <label htmlFor={formId + 'password'}>Password</label>
              <BaseInput
                className="flex-1 py-1 px-2"
                id={formId + 'password'}
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </fieldset>

            <ButtonPrimary color="blue" className="w-full" type="submit">
              Login
            </ButtonPrimary>
          </form>
        </BasePanel>
      </div>
    </div>
  );
};

export default Login;
