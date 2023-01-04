import BasePanelHeader from '@/components/BasePanelHeader';
import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import ReactDOM from 'react-dom';
import { RiCloseFill } from 'react-icons/ri';

export type BaseModalProps = {
  opened: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
};

const BaseModal = ({ opened, title, children, onClose }: BaseModalProps) => {
  return !opened
    ? null
    : ReactDOM.createPortal(
        <div
          className="fixed inset-0 z-50 flex flex-col items-center bg-zinc-900/80 "
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <div className="mt-32 w-full max-w-md border border-zinc-600 bg-zinc-800 text-sm text-zinc-300 shadow">
            <BasePanelHeader>
              <h3 className="px-1">{title}</h3>

              <ButtonPrimary withIcon className="ml-auto" onClick={onClose}>
                <RiCloseFill className="h-4 w-4" />
              </ButtonPrimary>
            </BasePanelHeader>

            {children}
          </div>
        </div>,
        document.getElementById('root') as HTMLElement,
      );
};

export default BaseModal;
