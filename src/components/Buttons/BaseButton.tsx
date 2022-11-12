import { twclsx } from '@/lib/twclsx';

export type BaseButtonProps = React.ComponentPropsWithoutRef<'button'>;

const BaseButton = ({ className, ...rest }: BaseButtonProps) => {
  return (
    <button
      className={twclsx(
        'rounded bg-slate-700 hover:bg-slate-600 transition-colors',
        className,
      )}
      {...rest}
    />
  );
};

export default BaseButton;
