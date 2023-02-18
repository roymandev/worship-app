import { atomWithStorage } from 'jotai/utils';

export const SCREEN_BASE_SIZE = {
  width: 480,
  height: 480,
  padding: 12,
  fontSize: 40,
  lineHeight: 60,
};

export const atomScreenSettings = atomWithStorage('screenSettings', {
  mainSize: { ...SCREEN_BASE_SIZE },
  hideText: false,
  hideScreen: false,
  textColor: '#ffffff',
});
