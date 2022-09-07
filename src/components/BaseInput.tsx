import { twclsx } from '@/lib/twclsx';

const BaseInput = ({
  className,
  type = 'text',
  ...rest
}: React.ComponentPropsWithoutRef<'input'>) => {
  return (
    <input
      type={type}
      className={twclsx(
        'rounded border border-slate-300 outline-none focus:border-blue-600',
        className,
      )}
      {...rest}
    />
  );
};

export default BaseInput;
