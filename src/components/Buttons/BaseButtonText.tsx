import {
  ButtonColors,
  BUTTON_TEXT_COLORS,
} from '@/components/Buttons/buttonColors';
import { twclsx } from '@/lib/twclsx';

export type BaseButtonTextProps = {
  color: keyof ButtonColors;
} & React.ComponentPropsWithoutRef<'button'>;

const BaseButtonText = ({ color, className, ...rest }: BaseButtonTextProps) => {
  return (
    <button
      type="button"
      className={twclsx(
        'outline-none',
        color && BUTTON_TEXT_COLORS[color],
        className,
      )}
      {...rest}
    />
  );
};

export default BaseButtonText;
