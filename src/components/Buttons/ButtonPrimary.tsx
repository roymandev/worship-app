import BaseButton from '@/components/Buttons/BaseButton';
import { BaseButtonTextProps } from '@/components/Buttons/BaseButtonText';
import { twclsx } from '@/lib/twclsx';

interface ButtonPrimaryProps extends BaseButtonTextProps {
  withIcon?: 'left' | 'right';
}

const ButtonPrimary = ({
  className,
  withIcon,
  ...rest
}: ButtonPrimaryProps) => {
  return (
    <BaseButton
      className={twclsx(
        'py-1 h-8',
        withIcon ? 'flex items-center gap-1' : 'px-4',
        withIcon === 'left' && 'pr-3 pl-2',
        withIcon === 'right' && 'pr-2 pl-3',
        className,
      )}
      {...rest}
    />
  );
};

export default ButtonPrimary;
