import useModal from '@/hooks/useModal';
import { RiSettings3Line } from 'react-icons/ri';
import Button from './Button';
import ModalSettings from './Modals/ModalSettings';

const Header = () => {
  const { isOpen, openModal, closeModal } = useModal();

  return (
    <div className="flex items-center border-b border-zinc-700 p-1 shadow">
      <img
        src="/Worship%20App.svg"
        alt="Worship App Logo"
        className="h-7 w-7 shadow"
      />
      <h1 className="ml-1 px-1 text-lg font-bold">Worship App</h1>

      <div className="ml-4">
        <Button onClick={openModal}>
          <RiSettings3Line className="h-4 w-4" />
          Settings
        </Button>
      </div>

      <ModalSettings opened={isOpen} onClose={closeModal} />
    </div>
  );
};

export default Header;
