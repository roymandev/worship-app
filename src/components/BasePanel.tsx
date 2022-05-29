const BasePanel = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex overflow-hidden flex-col">{children}</div>;
};

export default BasePanel;
