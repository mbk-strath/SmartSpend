import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { authAPI } from '../services/api'

const STATS = [
  { value: '12k+', label: 'Students' },
  { value: 'KES 4M', label: 'Tracked' },
  { value: '98%', label: 'Stay on budget' },
]

const TAGLINES = {
  login: {
    heading: 'Spend with intention.\nSave without thinking.',
    sub: 'A budgeting companion built for students — log it once, learn from it forever.',
  },
  register: {
    heading: 'Start your money\njourney today.',
    sub: 'Join thousands of students already building smarter spending habits.',
  },
}

export default function Login({ onLogin, mode: initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode)
  const [form, setForm] = useState({ email: '', username: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const tag = TAGLINES[mode]

  const handleSubmit = async () => {
    setError(''); setLoading(true)
    try {
      if (mode === 'register') {
        await authAPI.register({ email: form.email, username: form.username, password: form.password })
        setMode('login')
        setForm(f => ({ ...f, password: '' }))
        setLoading(false)
        return
      }
      const res = await authAPI.login({ email: form.email, password: form.password })
      localStorage.setItem('token', res.data.access_token)
      await onLogin()
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left — burgundy panel */}
      <div style={{
        width: '50%', minHeight: '100vh',
        background: 'linear-gradient(160deg, var(--burgundy-deep) 0%, var(--burgundy) 50%, #a0222f 100%)',
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '32px 48px',
      }}>
        {/* Noise texture */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <rect x="2" y="5" width="20" height="14" rx="2"/>
              <path d="M2 10h20"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'Instrument Serif, serif', fontSize: 18, color: '#fff' }}>
            SmartSpend
          </span>
        </div>

        {/* Heading */}
        <div>
          <h1 style={{
            fontFamily: 'Instrument Serif, serif', fontSize: 38, color: '#fff',
            lineHeight: 1.15, marginBottom: 16, fontWeight: 400,
            whiteSpace: 'pre-line',
          }}>
            {tag.heading}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.6, maxWidth: 320 }}>
            {tag.sub}
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 12 }}>
          {STATS.map(({ value, label }) => (
            <div key={label} style={{
              flex: 1, background: 'rgba(255,255,255,0.10)',
              borderRadius: 12, padding: '14px 16px',
              backdropFilter: 'blur(4px)',
            }}>
              <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 22, color: '#fff', lineHeight: 1 }}>
                {value}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form panel */}
      <div style={{
        width: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#faf8f6', padding: '32px 48px',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }} className="anim-up">
          <div style={{ marginBottom: 32 }}>
            <div style={{
              fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'var(--burgundy)', marginBottom: 8,
            }}>
              {mode === 'login' ? 'Welcome back' : 'Get started'}
            </div>
            <h2 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 30, color: 'var(--text-primary)', fontWeight: 400 }}>
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
              {mode === 'login'
                ? 'Enter your details to access your dashboard.'
                : 'Fill in your details to set up your free account.'}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Full name / username (register only) */}
            {mode === 'register' && (
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 500 }}>
                  Full name
                </label>
                <div style={{ position: 'relative' }}>
                  <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  <input className="input-field" placeholder="Jules Smith"
                    value={form.username} onChange={e => set('username', e.target.value)}
                    style={{ paddingLeft: 36 }} />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 500 }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input-field" type="email" placeholder="you@school.edu"
                  value={form.email} onChange={e => set('email', e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  style={{ paddingLeft: 36 }} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 500 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input-field" type={showPw ? 'text' : 'password'} placeholder="••••••••"
                  value={form.password} onChange={e => set('password', e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  style={{ paddingLeft: 36, paddingRight: 40 }} />
                <button type="button" onClick={() => setShowPw(v => !v)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  display: 'flex', padding: 0,
                }}>
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                padding: '10px 14px', borderRadius: 8,
                background: 'var(--red-bg)', color: 'var(--red)', fontSize: 13,
                border: '1px solid rgba(192,57,43,0.15)',
              }}>{error}</div>
            )}

            <button className="btn-primary" onClick={handleSubmit} disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: 4, borderRadius: 12, fontSize: 15 }}>
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
              {!loading && <ArrowRight size={15} />}
            </button>

            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
              {mode === 'login' ? (
                <>New here?{' '}
                  <button onClick={() => { setMode('register'); setError('') }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--burgundy)', fontWeight: 500, fontSize: 13 }}>
                    Create an account
                  </button>
                </>
              ) : (
                <>Already have an account?{' '}
                  <button onClick={() => { setMode('login'); setError('') }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--burgundy)', fontWeight: 500, fontSize: 13 }}>
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
