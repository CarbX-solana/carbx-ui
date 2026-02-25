import { useEffect, useRef } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useWallet } from '@solana/wallet-adapter-react'
import { useQueryClient } from '@tanstack/react-query'
import { ROUTE_PATHS } from '@/app/router/route-paths'
import { useLogoutMutation } from '@/shared/api/auth/queries/use-logout-mutation'
import { QUERY_KEYS } from '@/shared/constants/query-keys'

const navigationItems = [
  { to: ROUTE_PATHS.tokenize, label: 'Tokenize' },
  { to: ROUTE_PATHS.orders, label: 'Orders' },
  { to: ROUTE_PATHS.tokens, label: 'Tokens' },
] as const

export function AppShell() {
  const { connected } = useWallet()
  const queryClient = useQueryClient()
  const logoutMutation = useLogoutMutation()
  const wasConnectedRef = useRef(connected)

  useEffect(() => {
    const wasConnected = wasConnectedRef.current

    if (wasConnected && !connected) {
      queryClient.setQueryData(QUERY_KEYS.AUTH_ME, null)
      queryClient.removeQueries({ queryKey: QUERY_KEYS.PURO_ACCOUNT })
      queryClient.removeQueries({ queryKey: QUERY_KEYS.ORDERS_GROUPED })
      void logoutMutation.mutateAsync().catch(() => undefined)
    }

    wasConnectedRef.current = connected
  }, [connected, logoutMutation, queryClient])

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col p-4 sm:p-6">
      <header className="mb-7 grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <h1 className="m-0 text-3xl font-semibold tracking-tight">CarbX</h1>
        <nav
          aria-label="Main navigation"
          className="flex flex-wrap items-center justify-center gap-2.5"
        >
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) =>
                [
                  'inline-flex items-center justify-center rounded-xl border px-3.5 py-2 text-sm font-medium no-underline transition-colors',
                  isActive
                    ? 'border-blue-300 bg-blue-100 text-blue-950'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400',
                ].join(' ')
              }
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="wallet-connect sm:justify-self-end">
          <WalletMultiButton />
        </div>
      </header>
      <main className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
        <Outlet />
      </main>
    </div>
  )
}
