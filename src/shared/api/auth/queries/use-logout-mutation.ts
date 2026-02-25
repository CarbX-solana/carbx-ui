import { useMutation } from '@tanstack/react-query'
import { logout } from '../requests'

export function useLogoutMutation() {
  return useMutation<void, Error>({
    mutationFn: logout,
  })
}
