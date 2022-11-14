import Loading from '@/components/Fallback/Loading';

const LoadingFullscreen = () => (
  <div className="fixed inset-0 flex bg-zinc-800">
    <Loading />
  </div>
);

export default LoadingFullscreen;
