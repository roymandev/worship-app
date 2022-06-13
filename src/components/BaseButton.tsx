import { twMerge } from 'tailwind-merge';

const buttonVariant = {
  default:
    'text-slate-600 bg-slate-100 border border-slate-200 hover:bg-slate-200 hover:border-slate-300 focus:border-slate-500 disabled:text-slate-300 disabled:bg-slate-50 disabled:border-slate-100',
  primary:
    'text-blue-600 bg-blue-100 border border-blue-200 hover:bg-blue-200 hover:border-blue-300 focus:border-blue-500 disabled:text-blue-300 disabled:bg-blue-50 disabled:border-blue-100',
  red: 'text-red-600 bg-red-100 border border-red-200 hover:bg-red-200 hover:border-red-300 focus:border-red-500 disabled:text-red-300 disabled:bg-red-50 disabled:border-red-100',
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
