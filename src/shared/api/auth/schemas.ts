import { z } from 'zod'

export const AuthNonceSchema = z.object({
  walletAddress: z.string(),
  nonce: z.string(),
  message: z.string(),
  expiresAt: z.string(),
})

export const AuthVerifySignatureSchema = z.object({
  token: z.string(),
  user: z.unknown(),
})

export const AuthMeSchema = z
  .object({
    sub: z.string().optional(),
  })
  .passthrough()
