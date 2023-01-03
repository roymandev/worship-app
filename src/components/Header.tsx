const Header = () => {
  return (
    <div className="flex items-center gap-1 border-b border-zinc-600 p-1 shadow">
      <img
        src="/Worship%20App.svg"
        alt="Worship App Logo"
        className="h-7 w-7 shadow"
      />
      <h1 className="px-1 text-lg font-bold">Worship App</h1>
    </div>
  );
};

export default Header;
