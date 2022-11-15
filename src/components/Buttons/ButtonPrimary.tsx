import BaseButton, { BaseButtonProps } from '@/components/Buttons/BaseButton';
import { twclsx } from '@/lib/twclsx';

interface ButtonPrimaryProps extends BaseButtonProps {
  withIcon?: 'left' | 'right' | boolean;
}

const ButtonPrimary = ({
  className,
  withIcon,
  ...rest
}: ButtonPrimaryProps) => {
  return (
    <BaseButton
      className={twclsx(
        'flex items-center h-7 justify-center',
        withIcon ? 'gap-1' : 'px-3',
        withIcon === true && 'w-7',
        withIcon === 'left' && 'pr-4 pl-3',
        withIcon === 'right' && 'pr-3 pl-4',
        className,
      )}
      {...rest}
    />
  );
};

export default ButtonPrimary;
