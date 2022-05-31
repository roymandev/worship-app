import { twMerge } from 'tailwind-merge';

interface BasePanelHeaderProps {
  children: React.ReactNode;
  sub?: boolean;
}

const BasePanelHeader = ({ children, sub = false }: BasePanelHeaderProps) => {
  return (
    <div
      className={twMerge(
        'flex items-center border-b border-slate-300 flex-shrink-0',
        sub ? 'h-9 bg-slate-100' : 'h-9',
      )}
    >
      {children}
    </div>
  );
};

export default BasePanelHeader;
