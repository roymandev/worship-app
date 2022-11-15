import { twclsx } from '@/lib/twclsx';

interface BasePanelHeaderProps {
  children: React.ReactNode;
  className?: string;
  sub?: boolean;
}

const BasePanelHeader = ({
  children,
  className,
  sub = false,
}: BasePanelHeaderProps) => {
  return (
    <>
      <div
        className={twclsx(
          'flex items-center flex-shrink-0 p-1 gap-1 h-9',
          sub && 'bg-zinc-900',
          className,
        )}
      >
        {children}
      </div>
      <hr className="border-zinc-600" />
    </>
  );
};

export default BasePanelHeader;
