import { z } from 'zod'

export const pingSchema = z.object({
  message: z.string(),
  timestamp: z.string().datetime(),
})

export type Ping = z.infer<typeof pingSchema>
