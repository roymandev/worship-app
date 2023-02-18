import useModal from '@/hooks/useModal';
import { RiInformationLine, RiSettings3Line } from 'react-icons/ri';
import Button from './Button';
import ModalAbout from './Modals/ModalAbout';
import ModalSettings from './Modals/ModalSettings';

const Header = () => {
  const {
    isOpen: isOpenSettings,
    openModal: openModalSettings,
    closeModal: closeModalSettings,
  } = useModal();

  const {
    isOpen: isOpenAbout,
    openModal: openModalAbout,
    closeModal: closeModalAbout,
  } = useModal();

  return (
    <div className="flex items-center border-b border-zinc-700 p-1 shadow">
      <img
        src="/Worship%20App.svg"
        alt="Worship App Logo"
        className="h-7 w-7 shadow"
      />
      <h1 className="ml-1 px-1 text-lg font-bold">Worship App</h1>

      <div className="ml-4 flex gap-1">
        <Button onClick={openModalSettings}>
          <RiSettings3Line className="h-4 w-4" />
          Settings
        </Button>

        <Button onClick={openModalAbout}>
          <RiInformationLine className="h-4 w-4" />
          About
        </Button>
      </div>

      <ModalSettings opened={isOpenSettings} onClose={closeModalSettings} />
      <ModalAbout opened={isOpenAbout} onClose={closeModalAbout} />
    </div>
  );
};

export default Header;
