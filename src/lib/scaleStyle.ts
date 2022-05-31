import type { ScreenSettings, ScreenStyle } from '../stores/screenStore';

/**
 * Resize base style based on container width or height
 * @param container Container HTML Node
 * @param baseStyle Base style for reference
 * @returns zoomed style
 */
export const scaleStyle = (
  container: Element,
  baseStyle: ScreenSettings,
): ScreenStyle => {
  const scaledStyle = {} as ScreenStyle;
  let zoomPercent = 0;
  // Set zoom percent based on container width
  zoomPercent = (container.clientWidth / baseStyle.width) * 100;

  // If height is taller set zoom percent based on container height
  if ((baseStyle.height / 100) * zoomPercent > container.clientHeight) {
    zoomPercent = (container.clientHeight / baseStyle.height) * 100;
  }

  // set scaledStyle props to zoomed base style props
  let key: keyof ScreenStyle;
  for (key in baseStyle) {
    scaledStyle[key] = (baseStyle[key] / 100) * zoomPercent + 'px';
  }
  return scaledStyle;
};
