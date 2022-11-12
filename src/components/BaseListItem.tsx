import { twclsx } from '@/lib/twclsx';

export interface BaseListLineProps
  extends React.ComponentPropsWithoutRef<'li'> {
  isSelected: boolean;
}

const BaseListItem = ({
  isSelected,
  className,
  ...rest
}: BaseListLineProps) => (
  <li
    className={twclsx(
      'border-y border-transparent first:border-t-0 last:border-b-0',
      className,
      isSelected
        ? 'bg-blue-400/10 group-focus:bg-blue-400/40'
        : ' hover:bg-zinc-700',
    )}
    {...rest}
  />
);

export default BaseListItem;
