import { useQuery } from '@tanstack/react-query'
import { fetchGroupedOrders } from '../requests'
import type { GroupedOrders } from '../types'
import { QUERY_KEYS } from '@/shared/constants/query-keys'

type UseGroupedOrdersQueryParams = {
  enabled?: boolean
}

export function useGroupedOrdersQuery(params?: UseGroupedOrdersQueryParams) {
  return useQuery<GroupedOrders, Error>({
    queryKey: QUERY_KEYS.ORDERS_GROUPED,
    queryFn: fetchGroupedOrders,
    enabled: params?.enabled ?? true,
  })
}
