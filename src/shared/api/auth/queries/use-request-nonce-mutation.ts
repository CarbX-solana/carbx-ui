import { useMutation } from '@tanstack/react-query'
import { requestNonce } from '../requests'
import type { AuthNonce } from '../types'

export function useRequestNonceMutation() {
  return useMutation<AuthNonce, Error, string>({
    mutationFn: requestNonce,
  })
}
