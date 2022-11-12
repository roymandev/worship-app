import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import { auth } from '@/lib/firebase';
import { atomUser } from '@/stores/userStore';
import { signOut } from 'firebase/auth';
import { useAtomValue } from 'jotai';
import { Link } from 'react-router-dom';

const Header = () => {
  const user = useAtomValue(atomUser);

  return (
    <div className="flex items-center bg-white p-1 shadow">
      <img
        src="/Worship%20App.svg"
        alt="Worship App Logo"
        className="h-8 w-8"
      />
      <h1 className="ml-1 px-2 text-lg font-bold">Worship App</h1>

      <div className="ml-auto flex items-center gap-3">
        {user ? (
          <>
            <span>royman.dev@gmail.com</span>
            <ButtonPrimary color="red" onClick={() => signOut(auth)}>
              Logout
            </ButtonPrimary>
          </>
        ) : (
          <Link to="/login">
            <ButtonPrimary color="blue">Login</ButtonPrimary>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Header;
