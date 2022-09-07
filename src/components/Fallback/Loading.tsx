import { twclsx } from '@/lib/twclsx';
import { RiLoader4Fill } from 'react-icons/ri';

export interface LoadingProps {
  className?: string;
}

const Loading = ({ className }: LoadingProps) => (
  <div className="grid flex-1 place-items-center bg-white">
    <RiLoader4Fill
      className={twclsx('h-16 w-16 animate-spin text-slate-700', className)}
    />
  </div>
);

export default Loading;
