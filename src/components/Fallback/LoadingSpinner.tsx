import { RiLoader4Fill } from 'react-icons/ri';

const LoadingSpinner = () => (
  <div className="grid flex-1 place-items-center bg-white">
    <RiLoader4Fill className="h-20 w-20 flex-1 animate-spin" />
  </div>
);

export default LoadingSpinner;
