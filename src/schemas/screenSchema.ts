import { z } from 'zod';

export const BASE_SCREEN_SETTINGS = {
  mainSize: {
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

export const ScreenSizeSchema = z
  .object({
    width: z.number(),
    height: z.number(),
    padding: z.number(),
    fontSize: z.number(),
    lineHeight: z.number(),
  })
  .catch(BASE_SCREEN_SETTINGS.mainSize);

export const ScreenSchema = z
  .object({
    mainSize: ScreenSizeSchema,
    hideText: z.boolean(),
    hideScreen: z.boolean(),
    textColor: z.string(),
    backgroundColor: z.string(),
    backgroundImage: z.string().optional(),
  })
  .catch(BASE_SCREEN_SETTINGS);
