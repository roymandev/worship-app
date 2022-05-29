export const scrollToSelected = (
  container: HTMLUListElement,
  selectedIndex: number,
) => {
  const items = [...container.children] as HTMLElement[];

  if (items.length && items[selectedIndex]) {
    // Make sure the container position is relative
    container.style.position = 'relative';

    const containerScrollBottom = container.scrollTop + container.clientHeight;
    const containerPaddingTop = items[0].offsetTop;
    const containerPaddingBottom =
      container.scrollHeight -
      items[items.length - 1].offsetTop -
      items[items.length - 1].offsetHeight;

    const selectedItem = items[selectedIndex];
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
