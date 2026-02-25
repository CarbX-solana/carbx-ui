import { z } from 'zod'

const nullableString = z.string().nullable().optional()
const nullableNumber = z.number().nullable().optional()

export const OrderSchema = z.object({
  orderId: z.string(),
  orderType: z.string(),
  wallet: z.string(),
  puroAccountNumber: nullableString,
  receivedAmount: nullableNumber,
  puroIncomingTxId: nullableString,
  certificateId: nullableString,
  mintSignature: nullableString,
  puroInternalTransferTxId: nullableString,
  errorMessage: nullableString,
  vintage: nullableNumber,
  methodologyName: nullableString,
  status: z.string(),
  expiresAt: nullableString,
  createdAt: nullableString,
  updatedAt: nullableString,
})

export const GroupedOrderSchema = z.object({
  puroIncomingTxId: nullableString,
  status: z.string(),
  wallet: z.string(),
  puroAccountNumber: nullableString,
  createdAt: nullableString,
  updatedAt: nullableString,
  items: z.union([OrderSchema, z.array(OrderSchema)]).transform((value) => {
    return Array.isArray(value) ? value : [value]
  }),
})

export const GroupedOrdersSchema = z.union([
  z.array(GroupedOrderSchema),
  z.object({ data: z.array(GroupedOrderSchema) }).transform((value) => value.data),
  z
    .object({ items: z.array(GroupedOrderSchema) })
    .transform((value) => value.items),
  z
    .object({ orders: z.array(GroupedOrderSchema) })
    .transform((value) => value.orders),
  z.record(z.string(), GroupedOrderSchema).transform((value) => Object.values(value)),
])
