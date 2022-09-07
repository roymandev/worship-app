import Loading from '@/components/Fallback/Loading';

const FullScreenLoading = () => (
  <div className="fixed inset-0 flex">
    <Loading />
  </div>
);

export default FullScreenLoading;
