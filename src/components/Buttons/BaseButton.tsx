import BaseButtonText, {
  BaseButtonTextProps,
} from '@/components/Buttons/BaseButtonText';
import { BUTTON_COLORS } from '@/components/Buttons/buttonColors';
import { twclsx } from '@/lib/twclsx';

const BaseButton = ({ className, color, ...rest }: BaseButtonTextProps) => {
  return (
    <BaseButtonText
      color={color}
      className={twclsx(
        'rounded border',
        color && BUTTON_COLORS[color],
        className,
      )}
      {...rest}
    />
  );
};

export default BaseButton;
