import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { WalletConnectProvider } from '@btc-vision/walletconnect'
import App from './App'
import './index.css'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    {/*
      WalletConnectProvider wraps the entire app.
      It auto-configures the provider using the connected wallet's network.
      theme="dark" matches our dark crypto aesthetic.
    */}
    <WalletConnectProvider theme="dark">
      <App />
    </WalletConnectProvider>
  </StrictMode>,
)
