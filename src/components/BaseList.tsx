import { useEffect, useRef } from 'react';
import { Stack } from '@mantine/core';
import {
  getHotkeyHandler,
  useEventListener,
  useMergedRef,
} from '@mantine/hooks';

type KeydownHandler = (
  event: React.KeyboardEvent<HTMLElement> | KeyboardEvent,
) => void;

export interface BaseListProps<T> {
  items: T[];
  renderItem: (item: T, isSelected: boolean, index: number) => React.ReactNode;
  selectedItemIndex: number;
  onSelectItem: (item: T, index: number) => void;
  onKeyDownEnter?: KeydownHandler;
  onKeyDownArrowLeft?: KeydownHandler;
  onKeyDownArrowRight?: KeydownHandler;
}

const BaseList = <T,>({
  items,
  renderItem,
  selectedItemIndex,
  onSelectItem,
  onKeyDownEnter,
  onKeyDownArrowLeft,
  onKeyDownArrowRight,
}: BaseListProps<T>) => {
  const selectItemAbove = () => {
    const indexTarget = selectedItemIndex - 1;
    if (items[indexTarget]) onSelectItem(items[indexTarget], indexTarget);
  };
  const selectItemBelow = () => {
    const indexTarget = selectedItemIndex + 1;
    if (items[indexTarget]) onSelectItem(items[indexTarget], indexTarget);
  };
  const selectFirstItem = () => items[0] && onSelectItem(items[0], 0);
  const selectLastItem = () => {
    const indexTarget = items.length - 1;
    if (items[indexTarget]) onSelectItem(items[indexTarget], indexTarget);
  };

  const containerRef = useRef<HTMLDivElement | null>(null);
  const keyDownRef = useEventListener(
    'keydown',
    getHotkeyHandler([
      ['ArrowUp', selectItemAbove, { preventDefault: true }],
      ['ArrowDown', selectItemBelow, { preventDefault: true }],
      ['Home', selectFirstItem, { preventDefault: true }],
      ['End', selectLastItem, { preventDefault: true }],
      ['Enter', (e) => onKeyDownEnter?.(e), { preventDefault: true }],
      ['ArrowLeft', (e) => onKeyDownArrowLeft?.(e), { preventDefault: true }],
      ['ArrowRight', (e) => onKeyDownArrowRight?.(e), { preventDefault: true }],
    ]),
  );
  const mergedRef = useMergedRef(containerRef, keyDownRef);

  useEffect(() => {
    if (containerRef.current)
      containerRef.current.children[selectedItemIndex]?.scrollIntoView({
        block: 'nearest',
      });
  }, [selectedItemIndex]);

  return (
    <Stack
      ref={mergedRef}
      spacing={0}
      tabIndex={0}
      sx={{ overflowY: 'auto', whiteSpace: 'pre-line', flexGrow: 1 }}
    >
      {items.map((item, index) =>
        renderItem(item, selectedItemIndex === index, index),
      )}
    </Stack>
  );
};

export default BaseList;
