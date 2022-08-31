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
        ? 'bg-blue-300/20 group-focus:bg-blue-300/30 group-focus:border-blue-600 border-blue-200'
        : ' hover:bg-slate-100',
    )}
    {...rest}
  />
);

export default BaseListItem;
