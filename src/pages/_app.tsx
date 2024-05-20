import { wagmiConfig } from '@/config/wallet.config'
import { IPFSStorageProvider } from '@/context/IPFSStorage'
import { LitProtocolProvider } from '@/context/litProtocol'
import '@/styles/globals.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { AppProps } from 'next/app'
import { WagmiProvider } from 'wagmi'

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <LitProtocolProvider>
          <IPFSStorageProvider>
            <Component {...pageProps} />
          </IPFSStorageProvider>
        </LitProtocolProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
