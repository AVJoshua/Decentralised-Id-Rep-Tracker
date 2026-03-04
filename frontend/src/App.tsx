import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import ProtectedRoute from '@/components/ProtectedRoute'
import Landing   from '@/pages/Landing'
import Dashboard from '@/pages/Dashboard'
import Profile   from '@/pages/Profile'
import Attest    from '@/pages/Attest'
import Disputes  from '@/pages/Disputes'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-surface-0)' }}>
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Landing />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard"        element={<Dashboard />} />
              <Route path="/profile"          element={<Profile />} />
              <Route path="/profile/:address" element={<Profile />} />
              <Route path="/attest"           element={<Attest />} />
              <Route path="/disputes"         element={<Disputes />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
