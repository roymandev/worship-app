import { twclsx } from '@/lib/twclsx';

export type BaseButtonProps = React.ComponentPropsWithoutRef<'button'>;

const BaseButton = ({ className, ...rest }: BaseButtonProps) => {
  return (
    <button
      className={twclsx(
        'rounded bg-neutral-700 hover:bg-neutral-600 transition-colors',
        className,
      )}
      {...rest}
    />
  );
};

export default BaseButton;
