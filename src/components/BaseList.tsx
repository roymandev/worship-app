import { twclsx } from '@/lib/twclsx';
import { useEffect, useRef } from 'react';

type KeydownHandler = () => void;

export interface BaseListProps<T> {
  items: T[];
  renderItem: (item: T, isSelected: boolean, index: number) => React.ReactNode;
  selectedItemIndex: number;
  onSelectItem: (index: number) => void;
  className?: string;
  onKeyDownEnter?: KeydownHandler;
  onKeyDownArrowLeft?: KeydownHandler;
  onKeyDownArrowRight?: KeydownHandler;
}

const BaseList = <T,>({
  items,
  renderItem,
  selectedItemIndex,
  onSelectItem,
  className,
  onKeyDownEnter,
  onKeyDownArrowLeft,
  onKeyDownArrowRight,
}: BaseListProps<T>) => {
  const containerRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    if (containerRef.current)
      containerRef.current.children[selectedItemIndex]?.scrollIntoView({
        block: 'nearest',
      });
  }, [selectedItemIndex]);

  const onKeyDownHandler = (event: React.KeyboardEvent<HTMLUListElement>) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (items[selectedItemIndex - 1]) onSelectItem(selectedItemIndex - 1);
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (items[selectedItemIndex + 1]) onSelectItem(selectedItemIndex + 1);
    }
    if (event.key === 'Home') {
      event.preventDefault();
      if (items[0]) onSelectItem(0);
    }
    if (event.key === 'End') {
      event.preventDefault();
      if (items[items.length - 1]) onSelectItem(items.length - 1);
    }

    if (event.key === 'Enter' && onKeyDownEnter) {
      event.preventDefault();
      onKeyDownEnter();
    }
    if (event.key === 'ArrowLeft' && onKeyDownArrowLeft) {
      event.preventDefault();
      onKeyDownArrowLeft();
    }
    if (event.key === 'ArrowRight' && onKeyDownArrowRight) {
      event.preventDefault();
      onKeyDownArrowRight();
    }
  };

  return (
    <ul
      ref={containerRef}
      className={twclsx(
        'group flex flex-1 cursor-default select-none flex-col overflow-y-auto outline-none',
        className,
      )}
      tabIndex={0}
      onKeyDown={onKeyDownHandler}
    >
      {items.map((item, index) =>
        renderItem(item, selectedItemIndex === index, index),
      )}
    </ul>
  );
};

export default BaseList;
