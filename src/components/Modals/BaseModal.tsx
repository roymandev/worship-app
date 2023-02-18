import BasePanelHeader from '@/components/BasePanelHeader';
import Button from '@/components/Button';
import { twclsx } from '@/lib/twclsx';
import ReactDOM from 'react-dom';
import { RiCloseFill } from 'react-icons/ri';

export type ModalProps = {
  opened: boolean;
  onClose: () => void;
};

type BaseModalProps = ModalProps & {
  title: string;
  children: React.ReactNode;
  closeOnClickOutside?: boolean;
  className?: string;
};

const BaseModal = ({
  opened,
  title,
  children,
  onClose,
  closeOnClickOutside = true,
  className,
}: BaseModalProps) => {
  return !opened
    ? null
    : ReactDOM.createPortal(
        <div
          className="fixed inset-0 z-50 flex flex-col items-center bg-zinc-900/80 "
          onClick={(e) => {
            if (e.target === e.currentTarget && closeOnClickOutside) onClose();
          }}
        >
          <div
            className={twclsx(
              'mt-32 w-full max-w-md border border-zinc-700 bg-zinc-800 text-sm text-zinc-300 shadow',
              className,
            )}
          >
            <BasePanelHeader>
              <h3 className="px-1">{title}</h3>

              <Button
                title="Close modal"
                icon
                className="ml-auto"
                onClick={onClose}
              >
                <RiCloseFill className="h-4 w-4" />
              </Button>
            </BasePanelHeader>

            {children}
          </div>
        </div>,
        document.getElementById('root') as HTMLElement,
      );
};

export default BaseModal;
