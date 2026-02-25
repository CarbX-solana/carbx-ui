import axios from 'axios'
import { apiClient } from '@/shared/api/client'
import { AuthMeSchema, AuthNonceSchema, AuthVerifySignatureSchema } from './schemas'
import type {
  AuthMe,
  AuthNonce,
  AuthVerifySignatureResponse,
  VerifySignaturePayload,
} from './types'

export async function requestNonce(walletAddress: string): Promise<AuthNonce> {
  const response = await apiClient.post('/auth/nonce', {
    walletAddress,
  })
  return AuthNonceSchema.parse(response.data)
}

export async function verifySignature(
  payload: VerifySignaturePayload
): Promise<AuthVerifySignatureResponse> {
  const response = await apiClient.post('/auth/verify', payload)
  return AuthVerifySignatureSchema.parse(response.data)
}

export async function fetchAuthMe(): Promise<AuthMe | null> {
  try {
    const response = await apiClient.get('/auth/me')
    return AuthMeSchema.parse(response.data)
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return null
    }
    throw error
  }
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout')
}
