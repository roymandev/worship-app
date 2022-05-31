const BasePanel = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex overflow-hidden flex-col bg-white rounded shadow">
      {children}
    </div>
  );
};

export default BasePanel;
