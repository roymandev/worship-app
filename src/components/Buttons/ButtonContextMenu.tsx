import { twMerge } from 'tailwind-merge';
import BaseButtonText, { BaseButtonTextProps } from './BaseButtonText';

const ButtonContextMenu = ({ className, ...rest }: BaseButtonTextProps) => {
  return (
    <BaseButtonText
      className={twMerge(
        'py-1.5 text-left px-3 flex items-center justify-between',
        className,
      )}
      {...rest}
    />
  );
};

export default ButtonContextMenu;
