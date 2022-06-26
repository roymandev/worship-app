import { useEffect, useRef } from 'react';
import { twMerge } from 'tailwind-merge';

export interface BaseListProps extends React.ComponentPropsWithoutRef<'ul'> {
  children: React.ReactNode;
  scrollToIndex: number;
  onKeyDownArrowDown?: () => void;
  onKeyDownArrowUp?: () => void;
  onKeyDownArrowLeft?: () => void;
  onKeyDownArrowRight?: () => void;
  onKeyDownEnter?: () => void;
}

export const BaseList = ({
  children,
  scrollToIndex,
  className,
  onKeyDown,
  onKeyDownArrowDown,
  onKeyDownArrowUp,
  onKeyDownArrowLeft,
  onKeyDownArrowRight,
  onKeyDownEnter,
  ...rest
}: BaseListProps) => {
  const containerRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    if (containerRef.current && scrollToIndex !== undefined) {
      containerRef.current.children[scrollToIndex]?.scrollIntoView({
        block: 'nearest',
      });
    }
  }, [scrollToIndex]);

  const onKeyDownHandler = (event: React.KeyboardEvent<HTMLUListElement>) => {
    if (event.key === 'ArrowUp' && onKeyDownArrowUp) {
      event.preventDefault();
      onKeyDownArrowUp();
    }
    if (event.key === 'ArrowDown' && onKeyDownArrowDown) {
      event.preventDefault();
      onKeyDownArrowDown();
    }
    if (event.key === 'ArrowLeft' && onKeyDownArrowLeft) {
      event.preventDefault();
      onKeyDownArrowLeft();
    }
    if (event.key === 'ArrowRight' && onKeyDownArrowRight) {
      event.preventDefault();
      onKeyDownArrowRight();
    }
    if (event.key === 'Enter' && onKeyDownEnter) {
      event.preventDefault();
      onKeyDownEnter();
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
      onKeyDown={onKeyDownHandler}
      {...rest}
    >
      {children}
    </ul>
  );
};

export default BaseList;
