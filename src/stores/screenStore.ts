import { Screen, ScreenSchema, ScreenSizes } from '@/schemas/screenSchema';
import { atom, SetStateAction } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export const BASE_SCREEN_SETTINGS = {
  sizes: {
    width: 480,
    height: 480,
    padding: 12,
    fontSize: 40,
    lineHeight: 60,
  },
  hideText: false,
  hideScreen: false,
  textColor: '#ffffff',
  backgroundColor: '#141517',
};

// State
const settings = atomWithStorage('screenSettings', BASE_SCREEN_SETTINGS);
settings.onMount = (setValue) => {
  setValue((value) =>
    ScreenSchema.safeParse(value).success ? value : BASE_SCREEN_SETTINGS,
  );
};
settings.debugLabel = 'Settings';

// Setter
const updateSettings = atom(
  null,
  (get, set, update: SetStateAction<Partial<Screen>>) => {
    const nextVal =
      typeof update === 'function' ? update(get(settings)) : update;

    set(settings, (settings) => ({ ...settings, ...nextVal }));
  },
);

const updateSizes = atom(null, (get, set, update: Partial<ScreenSizes>) => {
  set(settings, (settings) => {
    return {
      ...settings,
      sizes: {
        ...settings.sizes,
        ...update,
      },
    };
  });
});

export const screenStore = {
  settings,
  updateSettings,
  updateSizes,
};
