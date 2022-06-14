import { twMerge } from 'tailwind-merge';
import BaseButton from './BaseButton';
import { BaseButtonTextProps } from './BaseButtonText';

interface ButtonDefaultProps extends BaseButtonTextProps {
  withIcon?: 'left' | 'right';
}

const ButtonDefault = ({
  className,
  withIcon,
  ...rest
}: ButtonDefaultProps) => {
  return (
    <BaseButton
      className={twMerge(
        'py-1',
        withIcon ? 'flex items-center gap-1' : 'px-3',
        withIcon === 'left' && 'pr-3 pl-2',
        withIcon === 'right' && 'pr-2 pl-3',
        className,
      )}
      {...rest}
    />
  );
};

export default ButtonDefault;
