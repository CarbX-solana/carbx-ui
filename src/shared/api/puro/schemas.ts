import { z } from 'zod'

export const PuroAccountSchema = z.object({
  wallet: z.unknown(),
  puroAccountNumber: z.string(),
})
