/* eslint-disable @typescript-eslint/no-explicit-any */
interface ListControllerOptions<Item> {
  items: Item[];
  selectedItemIndex: number;
  setItems?: (items: Item[]) => void;
  setSelectedItemIndex: (index: number) => void;
}

interface ListControllerReturns<Item> {
  selectedItem: () => Item | null;
  canShiftSelectedItemUp: () => boolean;
  canShiftSelectedItemDown: () => boolean;
  shiftSelectedItemUp: () => void;
  shiftSelectedItemDown: () => void;
  moveSelectedItemUp: () => void;
  moveSelectedItemDown: () => void;
}

interface ListControllerOverload {
  <Item>(
    options: Required<ListControllerOptions<Item>>,
  ): ListControllerReturns<Item>;
  <Item>(options: ListControllerOptions<Item>): Omit<
    ListControllerReturns<Item>,
    'moveSelectedItemUp' | 'moveSelectedItemDown'
  >;
}

export const listController: ListControllerOverload = (options: any): any => {
  const { items, selectedItemIndex, setSelectedItemIndex } = options;
  // Getter
  const selectedItem = () =>
    selectedItemIndex !== -1 ? items[selectedItemIndex] : null;
  const canShiftSelectedItemUp = () =>
    selectedItemIndex !== -1 && selectedItemIndex > 0;
  const canShiftSelectedItemDown = () =>
    selectedItemIndex !== -1 && selectedItemIndex < items.length - 1;

  // Actions
  const shiftSelectedItemUp = () => {
    if (canShiftSelectedItemUp()) {
      setSelectedItemIndex(selectedItemIndex - 1);
    } else if (!selectedItem() && items.length) setSelectedItemIndex(0);
  };

  const shiftSelectedItemDown = () => {
    if (canShiftSelectedItemDown()) {
      setSelectedItemIndex(selectedItemIndex + 1);
    } else if (!selectedItem() && items.length) setSelectedItemIndex(0);
  };

  if (options.setItems) {
    const { setItems } = options;
    const moveSelectedItemUp = () => {
      if (canShiftSelectedItemUp() && setItems) {
        [items[selectedItemIndex], items[selectedItemIndex - 1]] = [
          items[selectedItemIndex - 1],
          items[selectedItemIndex],
        ];
        setItems([...items]);
        shiftSelectedItemUp();
      }
    };

    const moveSelectedItemDown = () => {
      if (canShiftSelectedItemDown() && setItems) {
        [items[selectedItemIndex], items[selectedItemIndex + 1]] = [
          items[selectedItemIndex + 1],
          items[selectedItemIndex],
        ];
        setItems([...items]);
        shiftSelectedItemDown();
      }
    };
    return {
      selectedItem,
      canShiftSelectedItemUp,
      canShiftSelectedItemDown,
      shiftSelectedItemUp,
      shiftSelectedItemDown,
      moveSelectedItemUp,
      moveSelectedItemDown,
    };
  }
  return {
    selectedItem,
    canShiftSelectedItemUp,
    canShiftSelectedItemDown,
    shiftSelectedItemUp,
    shiftSelectedItemDown,
  };
};
