import { useEffect, useRef } from 'react';

export interface BaseListProps<T> {
  items: T[];
  renderItem: (item: T, isSelected: boolean) => React.ReactNode;
  selectedItemIndex: number;
  onSelectItem: (index: number) => void;
}

const BaseList = <T,>({
  items,
  renderItem,
  selectedItemIndex,
  onSelectItem,
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
  };

  return (
    <ul
      ref={containerRef}
      className="group flex flex-1 cursor-default select-none flex-col overflow-y-auto outline-none"
      tabIndex={-1}
      onKeyDown={onKeyDownHandler}
    >
      {items.map((item, index) =>
        renderItem(item, selectedItemIndex === index),
      )}
    </ul>
  );
};

export default BaseList;
