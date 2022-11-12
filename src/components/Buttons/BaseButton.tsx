import { twclsx } from '@/lib/twclsx';

export type BaseButtonProps = React.ComponentPropsWithoutRef<'button'>;

const BaseButton = ({ className, ...rest }: BaseButtonProps) => {
  return (
    <button
      className={twclsx(
        'rounded bg-zinc-700 hover:bg-zinc-600 transition-colors disabled:bg-zinc-700/30 disabled:text-zinc-500 shadow disabled:shadow-none',
        className,
      )}
      {...rest}
    />
  );
};

export default BaseButton;
