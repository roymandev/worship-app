import { twMerge } from 'tailwind-merge';

const buttonVariant = {
  default:
    'text-slate-700 disabled:text-slate-400 bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 border border-slate-300 hover:border-slate-400 focus:border-slate-600 disabled:border-slate-200',
  primary:
    'text-blue-700 disabled:text-blue-400 bg-blue-200 hover:bg-blue-300 disabled:bg-blue-100 border border-blue-300 hover:border-blue-400 focus:border-blue-600 disabled:border-blue-200',
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
        'rounded outline-none',
        variant && buttonVariant[variant],
        className,
      )}
    >
      {children}
    </button>
  );
};

export default BaseButton;
