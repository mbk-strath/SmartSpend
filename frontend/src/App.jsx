import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import Profile from './pages/Profile'
import { authAPI } from './services/api'

function ProtectedLayout({ user, children }) {
  if (!localStorage.getItem('token')) return <Navigate to="/login" replace />
  return (
    <>
      <Header user={user} />
      <main>{children}</main>
      <Footer />
    </>
  )
}

export default function App() {
  const [user, setUser]               = useState(null)
  const [bootstrapped, setBootstrapped] = useState(false)

  const fetchUser = async () => {
    try {
      const res = await authAPI.me()
      setUser(res.data)
    } catch {
      localStorage.removeItem('token')
      setUser(null)
    } finally {
      setBootstrapped(true)
    }
  }

  useEffect(() => {
    if (localStorage.getItem('token')) fetchUser()
    else setBootstrapped(true)
  }, [])

  if (!bootstrapped) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--border)', borderTop: '3px solid var(--burgundy)', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"     element={<Login onLogin={fetchUser} />} />
        <Route path="/signup"    element={<Signup />} />
        <Route path="/register"  element={<Navigate to="/signup" replace />} />
        <Route path="/dashboard" element={<ProtectedLayout user={user}><Dashboard user={user} /></ProtectedLayout>} />
        <Route path="/analytics" element={<ProtectedLayout user={user}><Analytics /></ProtectedLayout>} />
        <Route path="/profile"   element={<ProtectedLayout user={user}><Profile user={user} onUserChange={setUser} /></ProtectedLayout>} />
        <Route path="*"          element={<Navigate to={localStorage.getItem('token') ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
