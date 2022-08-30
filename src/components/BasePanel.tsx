export interface BasePanelProps {
  children: React.ReactNode;
}

const BasePanel = ({ children }: BasePanelProps) => (
  <div className="flex-1 rounded bg-white shadow">{children}</div>
);

export default BasePanel;
