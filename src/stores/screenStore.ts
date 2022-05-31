import { atomWithStorage } from 'jotai/utils';

export type ScreenSettings = Record<keyof typeof baseScreenSettings, number>;
export type ScreenStyle = Record<keyof typeof baseScreenSettings, string>;

const baseScreenSettings = {
  width: 848,
  height: 480,
  padding: 24,
  fontSize: 64,
  lineHeight: 80,
} as const;

export const screenSettingsAtom = atomWithStorage<ScreenSettings>(
  'screenSettings',
  baseScreenSettings,
);
