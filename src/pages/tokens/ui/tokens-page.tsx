import { useRef, useState } from 'react'
import { ExternalLink, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { PublicKey, Transaction } from '@solana/web3.js'
import { qist_puro } from 'qist-puro-sdk'
import { Button } from '@/shared/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'

type DasAsset = {
  id?: string
  authorities?: Array<{ address?: string }>
  content?: {
    metadata?: {
      name?: string | null
      symbol?: string | null
    }
    json_uri?: string | null
  }
  token_info?: {
    symbol?: string | null
    balance?: number | null
    decimals?: number | null
    ui_amount?: number | null
    uiAmount?: number | null
  } | null
}

type DasResponse = {
  result?: {
    items?: DasAsset[]
  }
}

type VintageToken = {
  mint: string
  name: string | null
  symbol: string | null
  uri: string | null
  tokenInfo: DasAsset['token_info']
}

type VintageRegistryMeta = {
  tokenMint: string
  companyId16: string
  year: number
}

type ToastType = 'info' | 'success' | 'error'
type ToastItem = {
  id: number
  type: ToastType
  text: string
  signature?: string
}

const DEFAULT_MINTER_PDA = 'Dccf2hLZmCDsQypSTYab2E4rbDday4SEEYBV8KTiPMX'
const DEFAULT_CONFIG_PUBKEY = 'CLNJGG3sZ8cxuveemDw9D1tk18q3QCWLWAAwpXumPVY8'

const MINTER_PDA = import.meta.env.VITE_MINTER_PDA ?? DEFAULT_MINTER_PDA
const RPC_URL = import.meta.env.VITE_RPC_URL ?? 'https://api.devnet.solana.com'
const CONFIG_PUBKEY = new PublicKey(
  import.meta.env.VITE_CONFIG_PUBKEY ?? DEFAULT_CONFIG_PUBKEY
)
const SOLSCAN_CLUSTER = RPC_URL.includes('devnet')
  ? 'devnet'
  : RPC_URL.includes('testnet')
    ? 'testnet'
    : null

async function getVintageTokens(ownerAddress: string): Promise<VintageToken[]> {
  const body = {
    jsonrpc: '2.0',
    id: 'vintage-assets',
    method: 'getAssetsByOwner',
    params: {
      ownerAddress,
      page: 1,
      limit: 1000,
      displayOptions: {
        showFungible: true,
        showNativeBalance: false,
      },
    },
  }

  const response = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`RPC request failed: ${response.status} ${response.statusText}`)
  }

  const data = (await response.json()) as DasResponse
  const items = data.result?.items ?? []

  const ours = items.filter(
    (asset) =>
      Array.isArray(asset.authorities) &&
      asset.authorities.some((authority) => authority?.address === MINTER_PDA)
  )

  return ours.map((asset) => ({
    mint: asset.id ?? '-',
    name: asset.content?.metadata?.name ?? asset.content?.metadata?.symbol ?? null,
    symbol: asset.content?.metadata?.symbol ?? asset.token_info?.symbol ?? null,
    uri: asset.content?.json_uri ?? null,
    tokenInfo: asset.token_info ?? null,
  }))
}

function formatAmount(token: VintageToken) {
  const uiAmount = token.tokenInfo?.ui_amount ?? token.tokenInfo?.uiAmount
  if (typeof uiAmount === 'number') return String(uiAmount)

  const balance = token.tokenInfo?.balance
  const decimals = token.tokenInfo?.decimals
  if (typeof balance === 'number' && typeof decimals === 'number') {
    return String(balance / 10 ** decimals)
  }

  return '-'
}

function formatMint(mint: string) {
  if (mint.length <= 14) return mint
  return `${mint.slice(0, 6)}...${mint.slice(-6)}`
}

function getSolscanTokenUrl(mint: string) {
  if (SOLSCAN_CLUSTER) {
    return `https://solscan.io/token/${mint}?cluster=${SOLSCAN_CLUSTER}`
  }
  return `https://solscan.io/token/${mint}`
}

export function TokensPage() {
  const { connection } = useConnection()
  const { connected, publicKey, sendTransaction } = useWallet()

  const ownerAddress = publicKey?.toBase58() ?? ''

  const vintageTokensQuery = useQuery<VintageToken[], Error>({
    queryKey: ['tokens', 'vintage', ownerAddress],
    queryFn: () => getVintageTokens(ownerAddress),
    enabled: Boolean(ownerAddress),
  })
  const registryMetaQuery = useQuery<VintageRegistryMeta[], Error>({
    queryKey: ['tokens', 'vintage-registry'],
    queryFn: async () => {
      const rawAccounts = await qist_puro.functions.getters.getSpecificAccounts(
        qist_puro.functions.getters.AccountId.VintageRegistry,
        connection
      )

      return rawAccounts
        .map((rawAccount) => {
          const account =
            rawAccount && typeof rawAccount === 'object' && 'account' in rawAccount
              ? (rawAccount as { account?: unknown }).account
              : rawAccount

          if (!account || typeof account !== 'object') return null

          const tokenMintRaw = (account as { tokenMint?: unknown }).tokenMint
          const tokenMint =
            tokenMintRaw instanceof PublicKey
              ? tokenMintRaw.toBase58()
              : typeof tokenMintRaw === 'string'
                ? tokenMintRaw
                : null

          const companyIdRaw = (account as { companyId?: unknown }).companyId
          const yearRaw = (account as { year?: unknown }).year

          const companyIdBytes = Array.isArray(companyIdRaw)
            ? companyIdRaw
            : companyIdRaw instanceof Uint8Array
              ? Array.from(companyIdRaw)
              : null

          const year = typeof yearRaw === 'number' ? yearRaw : null

          if (!tokenMint || !companyIdBytes || !year) return null

          const companyId16 = qist_puro.helpers
            .decodeFixedBytes16(companyIdBytes)
            .replaceAll(String.fromCharCode(0), '')

          if (!companyId16) return null

          return {
            tokenMint,
            companyId16,
            year,
          } satisfies VintageRegistryMeta
        })
        .filter((item): item is VintageRegistryMeta => item !== null)
    },
    enabled: connected,
  })

  const [burnToken, setBurnToken] = useState<VintageToken | null>(null)
  const [burnAmount, setBurnAmount] = useState('')
  const [puroUserUuid, setPuroUserUuid] = useState('')
  const [isBurning, setIsBurning] = useState(false)

  const [toasts, setToasts] = useState<ToastItem[]>([])
  const toastIdRef = useRef(1)

  function createToast(type: ToastType, text: string, autoCloseMs?: number) {
    const id = toastIdRef.current++
    setToasts((prev) => [...prev, { id, type, text }])
    if (autoCloseMs) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== id))
      }, autoCloseMs)
    }
    return id
  }

  function updateToast(
    id: number,
    patch: Partial<ToastItem>,
    autoCloseMs?: number
  ) {
    setToasts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    )
    if (autoCloseMs) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== id))
      }, autoCloseMs)
    }
  }

  async function handleBurnSubmit() {
    if (!burnToken) return
    if (!publicKey) {
      createToast('error', 'Wallet is not connected', 5000)
      return
    }

    const amount = Number(burnAmount)
    if (!Number.isFinite(amount) || amount <= 0) {
      createToast('error', 'Amount must be a positive number', 5000)
      return
    }

    if (!puroUserUuid.trim()) {
      createToast('error', 'Puro user address is required', 5000)
      return
    }

    const tokenRegistry = (registryMetaQuery.data ?? []).find(
      (registry) => registry.tokenMint === burnToken.mint
    )
    if (!tokenRegistry) {
      createToast(
        'error',
        'Registry data for selected token was not found',
        7000
      )
      return
    }

    setIsBurning(true)
    const toastId = createToast('info', 'Building burn transaction...')

    try {
      const registry = qist_puro.helpers.findRegistryPda(
        CONFIG_PUBKEY,
        tokenRegistry.companyId16,
        tokenRegistry.year
      )

      const burnResult = await qist_puro.functions.burnVintage({
        connection,
        accounts: {
          user: publicKey,
          config: CONFIG_PUBKEY,
          registry,
        },
        args: {
          amount,
          puroUserUuid: puroUserUuid.trim(),
        },
      })

      if (burnResult.instructions.length === 0) {
        throw new Error('Burn SDK returned empty instructions')
      }

      const transaction = new Transaction().add(...burnResult.instructions)
      transaction.feePayer = publicKey

      const { context, value } = await connection.getLatestBlockhashAndContext()
      transaction.recentBlockhash = value.blockhash

      updateToast(toastId, { type: 'info', text: 'Sending transaction...' })

      const signature = await sendTransaction(transaction, connection, {
        signers: burnResult.signers,
        skipPreflight: true,
        minContextSlot: context.slot,
      })

      await connection.confirmTransaction(
        {
          blockhash: value.blockhash,
          lastValidBlockHeight: value.lastValidBlockHeight,
          signature,
        },
        'confirmed'
      )

      updateToast(
        toastId,
        {
          type: 'success',
          text: 'Transaction confirmed',
          signature,
        },
        6000
      )

      setBurnToken(null)
      setBurnAmount('')
      setPuroUserUuid('')
      await vintageTokensQuery.refetch()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Burn failed'
      updateToast(toastId, { type: 'error', text: message }, 7000)
    } finally {
      setIsBurning(false)
    }
  }

  return (
    <section className="grid gap-5">
      <div className="grid gap-2">
        <h2 className="m-0 text-2xl font-semibold tracking-tight">Tokens</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tokenized CORC in your wallet</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {!connected ? (
            <div className="grid gap-2">
              <div className="wallet-connect">
                <WalletMultiButton />
              </div>
              <p className="m-0 text-sm text-muted-foreground">
                Connect wallet to load tokens.
              </p>
            </div>
          ) : null}

          {connected && !ownerAddress ? (
            <p className="m-0 text-sm text-muted-foreground">
              Waiting for wallet public key...
            </p>
          ) : null}

          <div className="flex justify-end">
            <Button
              disabled={!ownerAddress || vintageTokensQuery.isFetching}
              onClick={() => void vintageTokensQuery.refetch()}
              variant="outline"
            >
              {vintageTokensQuery.isFetching ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                'Refresh'
              )}
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mint</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ownerAddress && vintageTokensQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    Loading tokens...
                  </TableCell>
                </TableRow>
              ) : null}

              {ownerAddress && vintageTokensQuery.isError ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-destructive">
                    Failed to load tokens: {vintageTokensQuery.error.message}
                  </TableCell>
                </TableRow>
              ) : null}

              {ownerAddress &&
              !vintageTokensQuery.isLoading &&
              !vintageTokensQuery.isError &&
              (vintageTokensQuery.data?.length ?? 0) === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No tokens found for this wallet and minter.
                  </TableCell>
                </TableRow>
              ) : null}

              {(vintageTokensQuery.data ?? []).map((token) => (
                <TableRow key={token.mint}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatMint(token.mint)}</span>
                      <Button asChild size="xs" variant="ghost">
                        <a
                          href={getSolscanTokenUrl(token.mint)}
                          rel="noreferrer"
                          target="_blank"
                          title="Open in Solscan"
                        >
                          <ExternalLink className="size-3.5" />
                          <span className="sr-only">Open in Solscan</span>
                        </a>
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{token.name ?? '-'}</TableCell>
                  <TableCell>{token.symbol ?? '-'}</TableCell>
                  <TableCell className="text-right">{formatAmount(token)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        disabled={!publicKey || registryMetaQuery.isLoading}
                        onClick={() => {
                          setBurnToken(token)
                          setBurnAmount('')
                          setPuroUserUuid('')
                        }}
                        size="sm"
                        variant="outline"
                      >
                        Redeem
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(burnToken)}
        onOpenChange={(open) => {
          if (!open && !isBurning) {
            setBurnToken(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redeem token</DialogTitle>
            <DialogDescription className="text-slate-700">
              After burning, CORC tokens will be sent to the puro account you
              specify.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="rounded-md border bg-muted/20 p-3 text-sm">
              <p className="m-0">
                <span className="text-muted-foreground">Token:</span>{' '}
                {burnToken?.name ?? '-'}
              </p>
              <p className="m-0">
                <span className="text-muted-foreground">Symbol:</span>{' '}
                {burnToken?.symbol ?? '-'}
              </p>
              <p className="m-0">
                <span className="text-muted-foreground">Amount:</span>{' '}
                {burnToken ? formatAmount(burnToken) : '-'}
              </p>
              <p className="m-0 break-all">
                <span className="text-muted-foreground">Mint:</span>{' '}
                {burnToken?.mint ?? '-'}
              </p>
            </div>

            <div className="grid gap-1.5">
              <p className="m-0 text-sm text-slate-700">Amount</p>
              <Input
                inputMode="decimal"
                onChange={(event) => setBurnAmount(event.target.value)}
                placeholder="20"
                value={burnAmount}
              />
            </div>

            <div className="grid gap-1.5">
              <p className="m-0 text-sm text-slate-700">
                Puro receiving address
              </p>
              <Input
                onChange={(event) => setPuroUserUuid(event.target.value)}
                placeholder="d0e74115-132e-402f-838e-b2579dba6355"
                value={puroUserUuid}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              disabled={isBurning}
              onClick={() => setBurnToken(null)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={isBurning} onClick={() => void handleBurnSubmit()}>
              {isBurning ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Redeem'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="fixed right-4 bottom-4 z-[70] grid w-[min(34rem,calc(100vw-2rem))] gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={[
              'rounded-lg border p-4 text-base shadow-md',
              toast.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : toast.type === 'error'
                  ? 'border-rose-200 bg-rose-50 text-rose-800'
                  : 'border-slate-300 bg-white text-slate-800',
            ].join(' ')}
          >
            <p className="m-0">{toast.text}</p>
            {toast.signature ? (
              <p className="mt-1 mb-0 break-all text-xs text-muted-foreground">
                Signature: {toast.signature}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  )
}
