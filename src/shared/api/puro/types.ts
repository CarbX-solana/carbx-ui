import { z } from 'zod'
import { PuroAccountSchema } from './schemas'

export type PuroAccount = z.infer<typeof PuroAccountSchema>
