import { twMerge } from 'tailwind-merge';

const buttonVariant = {
  default:
    'border border-slate-300 bg-slate-200 hover:bg-slate-300 hover:border-slate-400 disabled:bg-slate-100 disabled:border-slate-200 disabled:text-slate-400',
  primary:
    'border text-blue-700 border-blue-300 bg-blue-200 hover:bg-blue-300 hover:border-blue-400 disabled:bg-blue-100 disabled:border-blue-200 disabled:text-blue-400',
};

export type BaseButtonProps = {
  variant?: keyof typeof buttonVariant;
} & React.ComponentPropsWithoutRef<'button'>;

const BaseButton = ({
  children,
  variant,
  className,
  ...rest
}: BaseButtonProps) => {
  return (
    <button
      type="button"
      {...rest}
      className={twMerge(
        'rounded',
        variant && buttonVariant[variant],
        className,
      )}
    >
      {children}
    </button>
  );
};

export default BaseButton;
