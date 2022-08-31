export interface BasePanelProps {
  children: React.ReactNode;
}

const BasePanel = ({ children }: BasePanelProps) => (
  <div className="flex flex-1 flex-col rounded bg-white shadow">{children}</div>
);

export default BasePanel;
