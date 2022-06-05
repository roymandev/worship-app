/* eslint-disable @typescript-eslint/no-explicit-any */
interface ListControllerBaseOptions<Item> {
  items: Item[];
  selectedItemIndex: number;
  setSelectedItemIndex: (index: number) => void;
  setItems?: (items: Item[]) => void;
}

interface ListControllerBaseReturns<Item> {
  selectedItem: () => Item | null;
  canShiftSelectedItemUp: () => boolean;
  canShiftSelectedItemDown: () => boolean;
  shiftSelectedItemUp: () => void;
  shiftSelectedItemDown: () => void;
}

interface ListControllerWithSetItemsReturns<Item>
  extends ListControllerBaseReturns<Item> {
  moveSelectedItemUp: () => void;
  moveSelectedItemDown: () => void;
  removeSelectedItem: () => void;
}

interface ListControllerOverload {
  <Item>(
    options: Required<ListControllerBaseOptions<Item>>,
  ): ListControllerWithSetItemsReturns<Item>;
  <Item>(
    options: ListControllerBaseOptions<Item>,
  ): ListControllerBaseReturns<Item>;
}

export const listController: ListControllerOverload = (options): any => {
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

    const removeSelectedItem = () => {
      if (selectedItem()) {
        items.splice(selectedItemIndex, 1);
        setItems([...items]);
      }
      if (canShiftSelectedItemUp() || !items.length) shiftSelectedItemUp();
    };

    return {
      selectedItem,
      canShiftSelectedItemUp,
      canShiftSelectedItemDown,
      shiftSelectedItemUp,
      shiftSelectedItemDown,
      moveSelectedItemUp,
      moveSelectedItemDown,
      removeSelectedItem,
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
