import { useEffect, useRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { scrollToSelected } from '../lib/scrollToSelected';

export interface BaseListProps<T> extends React.ComponentPropsWithoutRef<'ul'> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  scrollToIndex?: number;
}

export const BaseList = <T,>({
  items,
  renderItem,
  scrollToIndex,
  className,
  onKeyDown,
  ...rest
}: BaseListProps<T>) => {
  const containerRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    if (containerRef.current && scrollToIndex !== undefined) {
      scrollToSelected(containerRef.current, scrollToIndex);
    }
  }, [scrollToIndex]);

  return (
    <ul
      ref={containerRef}
      className={twMerge(
        'cursor-default group outline-none overflow-y-auto',
        className,
        'relative',
      )}
      tabIndex={scrollToIndex !== undefined ? 0 : -1}
      onKeyDown={onKeyDown}
      {...rest}
    >
      {items.map(renderItem)}
    </ul>
  );
};

export default BaseList;
