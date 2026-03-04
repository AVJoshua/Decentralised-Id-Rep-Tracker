import { Navigate, Outlet } from 'react-router-dom'
import { useWallet } from '@/hooks/useWallet'

/**
 * Renders child routes only if wallet is connected.
 * Uses publicKey !== null as the connection check.
 */
export default function ProtectedRoute() {
  const { isConnected } = useWallet()

  if (!isConnected) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
