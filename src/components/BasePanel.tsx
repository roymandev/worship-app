import { twclsx } from '@/lib/twclsx';

export interface BasePanelProps {
  children: React.ReactNode;
  className?: string;
}

const BasePanel = ({ children, className }: BasePanelProps) => (
  <div className={twclsx('flex flex-1 flex-col overflow-hidden', className)}>
    {children}
  </div>
);

export default BasePanel;
