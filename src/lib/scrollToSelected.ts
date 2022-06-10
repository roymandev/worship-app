export const scrollToSelected = (
  container: HTMLUListElement,
  selectedIndex: number,
) => {
  const items = container.children;

  if (items.length && items[selectedIndex]) {
    // Make sure the container position is relative
    container.style.position = 'relative';

    const firstChild = items[0] as HTMLElement;
    const lastChild = items[items.length - 1] as HTMLElement;
    const containerScrollBottom = container.scrollTop + container.clientHeight;
    const containerPaddingTop = firstChild.offsetTop;
    const containerPaddingBottom =
      container.scrollHeight - lastChild.offsetTop - lastChild.offsetHeight;

    const selectedItem = items[selectedIndex] as HTMLElement;
    const selectedItemOffsetBottom =
      selectedItem.offsetTop + selectedItem.offsetHeight;

    if (selectedItem.offsetTop < container.scrollTop) {
      // if selected item exceed container top
      container.scrollTop = selectedItem.offsetTop - containerPaddingTop;
    } else if (selectedItemOffsetBottom > containerScrollBottom) {
      // if selected item exceed container bottom
      container.scrollTop =
        selectedItemOffsetBottom -
        container.clientHeight +
        containerPaddingBottom;
    }
  }
};
