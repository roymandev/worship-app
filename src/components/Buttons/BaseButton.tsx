import { twMerge } from 'tailwind-merge';
import BaseButtonText, { BaseButtonTextProps } from './BaseButtonText';
import { BUTTON_COLORS } from './buttonColor';

const BaseButton = ({ className, color, ...rest }: BaseButtonTextProps) => {
  return (
    <BaseButtonText
      color={color}
      className={twMerge(
        'rounded border',
        color && BUTTON_COLORS[color],
        className,
      )}
      {...rest}
    />
  );
};

export default BaseButton;
