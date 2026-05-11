import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet, Eye, EyeOff } from 'lucide-react'
import { authAPI } from '../services/api'

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ email: '', username: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'register') {
        await authAPI.register({ email: form.email, username: form.username, password: form.password })
        setMode('login')
        setError('')
        setForm((f) => ({ ...f, password: '' }))
        return
      }
      const res = await authAPI.login({ email: form.email, password: form.password })
      localStorage.setItem('token', res.data.access_token)
      onLogin()
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-base)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background radial blobs */}
      <div style={{
        position: 'absolute', top: '15%', left: '20%',
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(52, 211, 153, 0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '15%',
        width: 300, height: 300,
        background: 'radial-gradient(circle, rgba(96, 165, 250, 0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div
        className="animate-fade-in-up"
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 24,
          padding: '36px 32px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 14,
            boxShadow: '0 8px 24px rgba(52, 211, 153, 0.25)',
          }}>
            <Wallet size={26} color="#080a0f" strokeWidth={2.5} />
          </div>
          <h1 style={{
            margin: 0, fontFamily: 'Syne, sans-serif', fontWeight: 800,
            fontSize: 26, letterSpacing: '-0.03em', color: 'var(--text-primary)',
          }}>
            Smart<span style={{ color: 'var(--accent-green)' }}>Spend</span>
          </h1>
          <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: 13 }}>
            {mode === 'login' ? 'Welcome back. Sign in to continue.' : 'Create your account to get started.'}
          </p>
        </div>

        {/* Mode tabs */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          background: 'var(--bg-card)', borderRadius: 12, padding: 4, marginBottom: 24, gap: 4,
        }}>
          {['login', 'register'].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError('') }}
              style={{
                padding: '8px 0', borderRadius: 9, border: 'none', cursor: 'pointer',
                fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 13,
                transition: 'all 0.2s',
                background: mode === m ? 'var(--bg-elevated)' : 'transparent',
                color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
              }}
            >
              {m === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Email */}
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontWeight: 500 }}>
              Email
            </label>
            <input
              className="input-field"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              autoComplete="email"
            />
          </div>

          {/* Username (register only) */}
          {mode === 'register' && (
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontWeight: 500 }}>
                Username
              </label>
              <input
                className="input-field"
                placeholder="your_username"
                value={form.username}
                onChange={(e) => set('username', e.target.value)}
                autoComplete="username"
              />
            </div>
          )}

          {/* Password */}
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontWeight: 500 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                className="input-field"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
                }}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: 10,
              background: 'rgba(251, 113, 133, 0.08)',
              border: '1px solid rgba(251, 113, 133, 0.2)',
              color: 'var(--accent-red)', fontSize: 13,
            }}>
              {error}
            </div>
          )}

          {mode === 'register' && !error && (
            <div style={{
              padding: '10px 14px', borderRadius: 10,
              background: 'rgba(52, 211, 153, 0.06)',
              border: '1px solid rgba(52, 211, 153, 0.15)',
              color: 'var(--accent-green)', fontSize: 12,
            }}>
              ✓ After registering, sign in with your credentials.
            </div>
          )}

          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={loading}
            style={{ marginTop: 6, width: '100%', padding: '12px 0', fontSize: 15 }}
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </div>

        <p style={{
          textAlign: 'center', marginTop: 22, fontSize: 12,
          color: 'var(--text-muted)',
        }}>
          Track smarter. Spend better.
        </p>
      </div>
    </div>
  )
}
