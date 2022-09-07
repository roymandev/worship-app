import BaseInput from '@/components/BaseInput';
import BasePanel from '@/components/BasePanel';
import BasePanelHeader from '@/components/BasePanelHeader';
import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import FullScreenLoading from '@/components/Fallback/FullScreenLoading';
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

  if (loading) return <FullScreenLoading />;

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-300 text-slate-700">
      <BasePanel className="w-full max-w-sm flex-none">
        <BasePanelHeader className="h-12">
          <h1 className="mx-auto px-1 text-lg font-medium">Login</h1>
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
  );
};

export default Login;
