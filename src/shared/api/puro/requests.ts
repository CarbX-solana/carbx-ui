import { apiClient } from '@/shared/api/client'
import { PuroAccountSchema } from './schemas'
import type { PuroAccount } from './types'

export async function fetchPuroAccount(): Promise<PuroAccount> {
  const response = await apiClient.get('/users/puro-account')
  return PuroAccountSchema.parse(response.data)
}
