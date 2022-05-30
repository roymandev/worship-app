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
        'rounded border border-gray-300 outline-none focus:border-blue-400',
        className,
      )}
      {...rest}
    />
  );
};

export default BaseInput;
