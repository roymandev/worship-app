import { twMerge } from 'tailwind-merge';
import { ButtonColors, BUTTON_TEXT_COLORS } from './buttonColor';

export type BaseButtonTextProps = {
  color: keyof ButtonColors;
} & React.ComponentPropsWithoutRef<'button'>;

const BaseButtonText = ({ color, className, ...rest }: BaseButtonTextProps) => {
  return (
    <button
      type="button"
      className={twMerge(
        'outline-none',
        color && BUTTON_TEXT_COLORS[color],
        className,
      )}
      {...rest}
    />
  );
};

export default BaseButtonText;
