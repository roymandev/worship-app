import { twclsx } from '@/lib/twclsx';
import { ComponentPropsWithoutRef } from 'react';

type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  color?: keyof typeof colors;
  icon?: boolean;
};

const colors = {
  gray: 'bg-zinc-700 hover:bg-zinc-600',
  blue: 'bg-sky-700 hover:bg-sky-600',
  yellow: 'bg-yellow-700 hover:bg-yellow-600',
  red: 'bg-red-700 hover:bg-red-600',
} as const;

const Button = ({ className, icon, color = 'gray', ...rest }: ButtonProps) => (
  <button
    className={twclsx(
      'flex h-7 items-center justify-center gap-2 text-white rounded px-3 shadow transition-colors disabled:bg-zinc-700/30 disabled:text-zinc-500 disabled:shadow-none',
      icon && 'w-7 p-0',
      colors[color],
      className,
    )}
    {...rest}
  />
);

export default Button;
