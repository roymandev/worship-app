import { RiLoader4Fill } from 'react-icons/ri';

const LoadingSpinner = () => (
  <div className="grid flex-1 place-items-center">
    <RiLoader4Fill className="h-20 w-20 flex-1 animate-spin text-zinc-600" />
  </div>
);

export default LoadingSpinner;
