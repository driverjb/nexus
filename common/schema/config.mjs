import { z } from 'zod';

export const config = z.object({
  port: z.number().default(3000),
  mediaFolders: z.array(z.string()).default([]),
  mediaStorageLocation: z.string().default(''),
  mediaDuplicationStorageLocation: z.string().default('')
});
