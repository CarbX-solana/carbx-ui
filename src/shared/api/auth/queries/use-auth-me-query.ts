import { useQuery } from '@tanstack/react-query'
import { fetchAuthMe } from '../requests'
import type { AuthMe } from '../types'
import { QUERY_KEYS } from '@/shared/constants/query-keys'

export function useAuthMeQuery() {
  return useQuery<AuthMe | null, Error>({
    queryKey: QUERY_KEYS.AUTH_ME,
    queryFn: fetchAuthMe,
    retry: false,
  })
}
