import BasePanel from '@/components/BasePanel';
import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import { auth } from '@/lib/firebase';
import { atomUser } from '@/stores/userStore';
import { signOut } from 'firebase/auth';
import { useAtomValue } from 'jotai';
import { Link } from 'react-router-dom';

const Header = () => {
  const user = useAtomValue(atomUser);

  return (
    <BasePanel className="flex-initial shrink-0 flex-row items-center p-1">
      <h1 className="px-3 text-lg font-bold">Worship App</h1>
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
    </BasePanel>
  );
};

export default Header;
