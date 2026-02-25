import { AppQueryProvider } from './providers/query-provider'
import { AppRouterProvider } from './providers/router-provider'
import { SolanaProvider } from './providers/solana-provider'

function App() {
  return (
    <AppQueryProvider>
      <SolanaProvider>
        <AppRouterProvider />
      </SolanaProvider>
    </AppQueryProvider>
  )
}

export default App
