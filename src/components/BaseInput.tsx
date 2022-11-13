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
        'rounded border border-zinc-600 bg-transparent outline-none bg-zinc-800 focus:border-sky-500 placeholder:text-zinc-500 h-7',
        className,
      )}
      {...rest}
    />
  );
};

export default BaseInput;
