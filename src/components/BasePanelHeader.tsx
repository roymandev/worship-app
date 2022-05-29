const BasePanelHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex items-center h-10 border-b border-gray-300">
      {children}
    </div>
  );
};

export default BasePanelHeader;
