import { twMerge } from 'tailwind-merge';
import BaseButtonText, { BaseButtonTextProps } from './BaseButtonText';

const baseButtonColor = {
  gray: 'bg-slate-200/30 border-slate-300 hover:border-slate-500 focus:border-slate-500 disabled:border-slate-200',
  blue: 'bg-blue-200/30 border-blue-300 hover:border-blue-500 focus:border-blue-500 disabled:border-blue-200',
  red: 'bg-red-200/30 border-red-300 hover:border-red-500 focus:border-red-500 disabled:border-red-200',
  green:
    'bg-green-200/30 border-green-300 hover:border-green-500 focus:border-green-500 disabled:border-green-200',
  purple:
    'bg-purple-200/30 border-purple-300 hover:border-purple-500 focus:border-purple-500 disabled:border-purple-200',
};

const BaseButton = ({ className, color, ...rest }: BaseButtonTextProps) => {
  return (
    <BaseButtonText
      color={color}
      className={twMerge(
        'rounded border',
        color && baseButtonColor[color],
        className,
      )}
      {...rest}
    />
  );
};

export default BaseButton;
