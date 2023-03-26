import { z } from 'zod';

export const ScreenSizesSchema = z.object({
  width: z.number(),
  height: z.number(),
  padding: z.number(),
  fontSize: z.number(),
  lineHeight: z.number(),
});

export const ScreenSchema = z.object({
  sizes: ScreenSizesSchema,
  hideText: z.boolean(),
  hideScreen: z.boolean(),
  textColor: z.string(),
  backgroundColor: z.string(),
  backgroundImage: z.string().optional(),
});

export type Screen = z.infer<typeof ScreenSchema>;
export type ScreenSizes = z.infer<typeof ScreenSizesSchema>;
