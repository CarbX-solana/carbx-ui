import { useMutation } from '@tanstack/react-query'
import { verifySignature } from '../requests'
import type { AuthVerifySignatureResponse, VerifySignaturePayload } from '../types'

export function useVerifySignatureMutation() {
  return useMutation<AuthVerifySignatureResponse, Error, VerifySignaturePayload>({
    mutationFn: verifySignature,
  })
}
