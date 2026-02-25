import { apiClient } from '@/shared/api/client'
import { GroupedOrdersSchema } from './schemas'
import type { GroupedOrders } from './types'

export async function fetchGroupedOrders(): Promise<GroupedOrders> {
  const response = await apiClient.get('/orders/grouped')
  return GroupedOrdersSchema.parse(response.data)
}
