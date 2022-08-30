const Home = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-8 bg-slate-900 p-4 text-center text-slate-300">
      <h1 className="text-6xl font-bold">React Template</h1>
      <a
        className="rounded bg-slate-800 px-6 py-3 text-2xl shadow transition-colors hover:bg-slate-700"
        href="https://github.com/roymandev/template-react"
      >
        Visit Repository
      </a>
    </div>
  );
};

export default Home;
