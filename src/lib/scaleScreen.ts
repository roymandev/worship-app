interface Container {
  width: number;
  height: number;
}

type ScreenSize = Record<string, number>;

export const scaleScreen = (screenSize: ScreenSize, container: Container) => {
  // Set zoom based on container width
  let zoom = (container.width / screenSize.width) * 100;

  // If scaled height is still overflowing, set zoom based on container height
  if ((screenSize.height / 100) * zoom > container.height)
    zoom = (container.height / screenSize.height) * 100;

  const scaledSize = {} as ScreenSize;
  const scaledStyle = {} as Record<string, string>;

  // Scale all screenSize property
  let key: keyof ScreenSize;
  for (key in screenSize) {
    scaledSize[key] = (screenSize[key] / 100) * zoom;
    scaledStyle[key] = scaledSize[key] + 'px';
  }

  return { scaledSize, scaledStyle };
};
