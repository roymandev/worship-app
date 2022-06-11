import type { ScreenSize } from '../stores/screenStore';

/**
 * Resize base style based on container width or height
 * @param container Container HTML Node
 * @param baseScreenSize Base size for reference
 * @returns scaled screen size
 */
export const scaleScreenSize = (
  container: Element,
  baseScreenSize: ScreenSize,
): ScreenSize => {
  const scaledScreenSize = {} as ScreenSize;
  let zoomPercent = 0;

  // Set zoom percent based on container width
  zoomPercent = (container.clientWidth / baseScreenSize.width) * 100;

  // If height is taller set zoom percent based on container height
  if ((baseScreenSize.height / 100) * zoomPercent > container.clientHeight) {
    zoomPercent = (container.clientHeight / baseScreenSize.height) * 100;
  }

  // set scaledStyle props to zoomed base style props
  let key: keyof ScreenSize;
  for (key in baseScreenSize) {
    scaledScreenSize[key] = (baseScreenSize[key] / 100) * zoomPercent;
  }
  return scaledScreenSize;
};
