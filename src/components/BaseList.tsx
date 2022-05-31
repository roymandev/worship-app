import { useEffect, useRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { scrollToSelected } from '../lib/scrollToSelected';

export interface BaseListProps<T> extends React.ComponentPropsWithoutRef<'ul'> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  selectedItemIndex?: number;
}

export const BaseList = <T,>({
  items,
  renderItem,
  selectedItemIndex,
  className,
  onKeyDown,
  ...rest
}: BaseListProps<T>) => {
  const containerRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    if (containerRef.current && selectedItemIndex !== undefined) {
      scrollToSelected(containerRef.current, selectedItemIndex);
    }
  }, [selectedItemIndex]);

  return (
    <ul
      ref={containerRef}
      className={twMerge(
        'cursor-default group outline-none',
        className,
        'relative',
      )}
      tabIndex={selectedItemIndex !== undefined ? 0 : -1}
      onKeyDown={onKeyDown}
      {...rest}
    >
      {items.map(renderItem)}
    </ul>
  );
};

export default BaseList;
