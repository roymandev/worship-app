import { atomWithStorage } from 'jotai/utils';

export type ScreenSize = typeof baseScreenSize;
export type ScreenStyle = Record<keyof ScreenSize, string>;

const baseScreenSize = {
  width: 480,
  height: 480,
  padding: 12,
  fontSize: 40,
  lineHeight: 60,
};

export const atomBaseScreenSize = atomWithStorage(
  'baseScreenSize',
  baseScreenSize,
);

export const atomMainScreenSize = atomWithStorage(
  'mainScreenSize',
  baseScreenSize,
);
