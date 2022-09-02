import { atom } from 'jotai';

export const atomScreenSettings = atom({
  size: {
    width: 480,
    height: 480,
    padding: 12,
    fontSize: 40,
    lineHeight: 60,
  },
});
