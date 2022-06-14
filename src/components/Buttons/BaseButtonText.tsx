import { twMerge } from 'tailwind-merge';

const buttonColor = {
  gray: 'text-slate-700 hover:bg-slate-200 focus:bg-slate-400/30 disabled:text-slate-400 disabled:bg-slate-200/20',
  blue: 'text-blue-700 hover:bg-blue-200 focus:bg-blue-400/30 disabled:text-blue-400 disabled:bg-blue-200/20',
  red: 'text-red-700 hover:bg-red-200 focus:bg-red-400/30 disabled:text-red-400 disabled:bg-red-200/20',
  green:
    'text-green-700 hover:bg-green-200 focus:bg-green-400/30 disabled:text-green-400 disabled:bg-green-200/20',
  purple:
    'text-purple-700 hover:bg-purple-200 focus:bg-purple-400/30 disabled:text-purple-400 disabled:bg-purple-200/20',
};

export type BaseButtonTextProps = {
  color: keyof typeof buttonColor;
} & React.ComponentPropsWithoutRef<'button'>;

const BaseButtonText = ({ color, className, ...rest }: BaseButtonTextProps) => {
  return (
    <button
      type="button"
      className={twMerge(
        'outline-none',
        color && buttonColor[color],
        className,
      )}
      {...rest}
    />
  );
};

export default BaseButtonText;
