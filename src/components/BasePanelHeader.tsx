import { twMerge } from 'tailwind-merge';

interface BasePanelHeaderProps {
  children: React.ReactNode;
  sub?: boolean;
}

const BasePanelHeader = ({ children, sub = false }: BasePanelHeaderProps) => {
  return (
    <div
      className={twMerge(
        'flex items-center border-b border-gray-300',
        sub ? 'h-8 bg-gray-100' : 'h-10',
      )}
    >
      {children}
    </div>
  );
};

export default BasePanelHeader;
