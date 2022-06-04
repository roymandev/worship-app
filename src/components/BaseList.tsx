import { useEffect, useRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { scrollToSelected } from '../lib/scrollToSelected';

export interface BaseListProps<T> extends React.ComponentPropsWithoutRef<'ul'> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  scrollToIndex: number;
  onKeyDownArrowDown?: () => void;
  onKeyDownArrowUp?: () => void;
}

export const BaseList = <T,>({
  items,
  renderItem,
  scrollToIndex,
  className,
  onKeyDown,
  onKeyDownArrowDown,
  onKeyDownArrowUp,
  ...rest
}: BaseListProps<T>) => {
  const containerRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    if (containerRef.current && scrollToIndex !== undefined) {
      scrollToSelected(containerRef.current, scrollToIndex);
    }
  }, [scrollToIndex]);

  const onKeyDownHandler = (event: React.KeyboardEvent<HTMLUListElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        onKeyDownArrowDown?.();
        break;
      case 'ArrowUp':
        event.preventDefault();
        onKeyDownArrowUp?.();
        break;
    }
    onKeyDown?.(event);
  };

  return (
    <ul
      ref={containerRef}
      className={twMerge(
        'cursor-default group outline-none overflow-y-auto select-none',
        className,
        'relative',
      )}
      tabIndex={scrollToIndex !== undefined ? 0 : -1}
      onKeyDown={onKeyDownHandler}
      {...rest}
    >
      {items.map(renderItem)}
    </ul>
  );
};

export default BaseList;
