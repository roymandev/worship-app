import { twMerge } from 'tailwind-merge';

const BaseInput = ({
  className,
  type = 'text',
  ...rest
}: React.ComponentPropsWithoutRef<'input'>) => {
  return (
    <input
      type={type}
      className={twMerge(
        'rounded border border-slate-300 outline-none focus:border-blue-500/80',
        className,
      )}
      {...rest}
    />
  );
};

export default BaseInput;
