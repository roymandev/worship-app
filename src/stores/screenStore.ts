import { atomWithStorage } from 'jotai/utils';

const BASE_SIZE: Record<string, number> = {
  width: 480,
  height: 480,
  padding: 12,
  fontSize: 40,
  lineHeight: 60,
};

export const atomScreenSettings = atomWithStorage('screenSettings', {
  baseSize: { ...BASE_SIZE },
  hideText: false,
  hideScreen: false,
});

export const atomScreenMainSize = atomWithStorage('screenMainSize', {
  ...BASE_SIZE,
});
