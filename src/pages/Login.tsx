import BaseInput from '@/components/BaseInput';
import BasePanel from '@/components/BasePanel';
import BasePanelHeader from '@/components/BasePanelHeader';
import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import LoadingFullscreen from '@/components/Fallback/LoadingFullscreen';
import useAuth from '@/hooks/useAuth';
import { useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const formId = useId();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    await login(email, password).then(
      (user) => user && navigate('/', { replace: true }),
    );
    setLoading(false);
  };

  if (loading) return <LoadingFullscreen />;

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
