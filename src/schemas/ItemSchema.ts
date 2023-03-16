import { z } from 'zod';

export const BaseItemLine = z.object({
  text: z.string().catch('-'),
  type: z.string().optional().catch(undefined),
});

export const BaseItemSchema = z.object({
  id: z.string().catch(crypto.randomUUID()),
  title: z.string().catch('Untitled'),
  content: z.array(BaseItemLine).catch([]),
});

export type BaseItem = z.infer<typeof BaseItemSchema>;
export type BaseItemLine = z.infer<typeof BaseItemLine>;
