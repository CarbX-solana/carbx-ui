import { useQuery } from '@tanstack/react-query'
import { fetchPuroAccount } from '../requests'
import type { PuroAccount } from '../types'
import { QUERY_KEYS } from '@/shared/constants/query-keys'

export function usePuroAccountQuery() {
  return useQuery<PuroAccount, Error>({
    queryKey: QUERY_KEYS.PURO_ACCOUNT,
    queryFn: fetchPuroAccount,
    enabled: false,
  })
}
