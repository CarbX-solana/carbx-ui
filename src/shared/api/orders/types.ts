import { z } from 'zod'
import { GroupedOrderSchema, GroupedOrdersSchema, OrderSchema } from './schemas'

export type Order = z.infer<typeof OrderSchema>
export type GroupedOrder = z.infer<typeof GroupedOrderSchema>
export type GroupedOrders = z.infer<typeof GroupedOrdersSchema>
