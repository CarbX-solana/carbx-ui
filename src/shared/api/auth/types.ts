import { z } from 'zod'
import {
  AuthMeSchema,
  AuthNonceSchema,
  AuthVerifySignatureSchema,
} from './schemas'

export type AuthNonce = z.infer<typeof AuthNonceSchema>
export type AuthVerifySignatureResponse = z.infer<typeof AuthVerifySignatureSchema>
export type AuthMe = z.infer<typeof AuthMeSchema>

export type VerifySignaturePayload = {
  walletAddress: string
  nonce: string
  signature: string
}
