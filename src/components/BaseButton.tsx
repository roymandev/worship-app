import { twMerge } from 'tailwind-merge';

const buttonVariant = {
  default:
    'rounded border border-slate-300 bg-slate-200 hover:bg-slate-300 hover:border-slate-400 disabled:bg-slate-100 disabled:border-slate-200 disabled:text-slate-400',
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
      className={twMerge(variant && buttonVariant[variant], className)}
    >
      {children}
    </button>
  );
};

export default BaseButton;
