import BasePanel from '@/components/BasePanel';
import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import useAuth from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <BasePanel className="flex-initial flex-row items-center p-1">
      <h1 className="px-3 text-lg font-bold">Worship App</h1>
      <div className="ml-auto flex items-center gap-3">
        {user ? (
          <>
            <span>royman.dev@gmail.com</span>
            <ButtonPrimary color="red" onClick={logout}>
              Logout
            </ButtonPrimary>
          </>
        ) : (
          <Link to="/login">
            <ButtonPrimary color="blue">Login</ButtonPrimary>
          </Link>
        )}
      </div>
    </BasePanel>
  );
};

export default Header;
