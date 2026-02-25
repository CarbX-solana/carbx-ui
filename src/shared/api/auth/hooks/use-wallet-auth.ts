import { useWallet } from '@solana/wallet-adapter-react'
import bs58 from 'bs58'
import { useAuthMeQuery } from '@/shared/api/auth/queries/use-auth-me-query'
import { useRequestNonceMutation } from '@/shared/api/auth/queries/use-request-nonce-mutation'
import { useVerifySignatureMutation } from '@/shared/api/auth/queries/use-verify-signature-mutation'

export function useWalletAuth() {
  const { connected, publicKey, signMessage } = useWallet()

  const authMeQuery = useAuthMeQuery()
  const requestNonceMutation = useRequestNonceMutation()
  const verifySignatureMutation = useVerifySignatureMutation()

  const walletAddress = publicKey?.toBase58() ?? ''
  const hasBackendSession = authMeQuery.isSuccess && authMeQuery.data !== null
  const isAuthLoading =
    authMeQuery.isFetching ||
    requestNonceMutation.isPending ||
    verifySignatureMutation.isPending

  async function refetchAuth() {
    const result = await authMeQuery.refetch()
    return result.isSuccess && result.data !== null
  }

  async function signInWithWallet() {
    if (!walletAddress || !signMessage) return false

    const noncePayload = await requestNonceMutation.mutateAsync(walletAddress)
    const signedMessage = await signMessage(
      new TextEncoder().encode(noncePayload.message)
    )
    const signature = bs58.encode(signedMessage)

    await verifySignatureMutation.mutateAsync({
      walletAddress,
      nonce: noncePayload.nonce,
      signature,
    })

    return refetchAuth()
  }

  async function ensureAuthorized() {
    if (hasBackendSession) return true
    if (!connected || !walletAddress || !signMessage) return false
    return signInWithWallet()
  }

  async function checkSessionAlive() {
    return refetchAuth()
  }

  return {
    connected,
    signMessage,
    walletAddress,
    hasBackendSession,
    isAuthorized: hasBackendSession,
    isAuthLoading,
    authError: verifySignatureMutation.isError,
    signInWithWallet,
    ensureAuthorized,
    checkSessionAlive,
  }
}
