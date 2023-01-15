interface Container {
  width: number;
  height: number;
}

type ScreenSize = Record<string, number>;

export const scaleScreen = (screenSize: ScreenSize, container: Container) => {
  const zoom = calculateZoom(screenSize, container);
  const scaledSize = scaleScreenSize(screenSize, zoom);
  const scaledStyle = createScaledStyle(scaledSize);
  return { scaledSize, scaledStyle };
};

const calculateZoom = (screenSize: ScreenSize, container: Container) => {
  // Set zoom based on container width
  let zoom = (container.width / screenSize.width) * 100;

  // If scaled height is still overflowing, set zoom based on container height
  if ((screenSize.height / 100) * zoom > container.height)
    zoom = (container.height / screenSize.height) * 100;

  return zoom;
};

const scaleScreenSize = (screenSize: ScreenSize, zoom: number) => {
  const scaledSize = {} as ScreenSize;
  let key: keyof ScreenSize;
  for (key in screenSize) {
    scaledSize[key] = (screenSize[key] / 100) * zoom;
  }
  return scaledSize;
};

const createScaledStyle = (scaledSize: ScreenSize) => {
  const scaledStyle = {} as Record<string, string>;
  let key: keyof ScreenSize;
  for (key in scaledSize) {
    scaledStyle[key] = scaledSize[key] + 'px';
  }
  return scaledStyle;
};
