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
    <div
      className={twclsx(
        'flex items-center border-b border-slate-300 flex-shrink-0 p-1 gap-1 h-10',
        sub && 'bg-slate-100',
        className,
      )}
    >
      {children}
    </div>
  );
};

export default BasePanelHeader;
