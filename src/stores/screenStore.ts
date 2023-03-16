import { atomWithLocalStorage } from '@/lib/atomWithLocalStorage';
import { BASE_SCREEN_SETTINGS, ScreenSchema } from '@/schemas/screenSchema';

export const atomScreenSettings = atomWithLocalStorage(
  'screenSettings',
  BASE_SCREEN_SETTINGS,
  (storageValue) => ScreenSchema.parse(storageValue),
);
