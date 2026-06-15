import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import WalletOutlinedIcon from '@mui/icons-material/WalletOutlined'
import { authAPI } from '../services/api'

const STATS = [
  { value: '12k+',   label: 'Students' },
  { value: 'KES 4M', label: 'Tracked' },
  { value: '98%',    label: 'Stay on budget' },
]

export default function Login({ onLogin }) {
  const [form, setForm]     = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const navigate = useNavigate()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    setError(''); setLoading(true)
    try {
      if (!form.email || !form.password) {
        setError('Email and password are required.')
        return
      }
      const res = await authAPI.login({ email: form.email, password: form.password })
      localStorage.setItem('token', res.data.access_token)
      await onLogin()
      navigate('/dashboard')
    } catch(err) {
      setError(err.response?.data?.detail || 'Something went wrong.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* Left panel */}
      <div style={{ width: '50%', minHeight: '100vh', background: 'linear-gradient(160deg, var(--burgundy-deep) 0%, var(--burgundy) 55%, #a0222f 100%)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '36px 52px' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <WalletOutlinedIcon style={{ fontSize: 17, color: '#fff' }} />
          </div>
          <span style={{ fontFamily: 'Instrument Serif, serif', fontSize: 20, color: '#fff' }}>SmartSpend</span>
        </div>

        <div>
          <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 42, color: '#fff', lineHeight: 1.12, marginBottom: 18, fontWeight: 400, whiteSpace: 'pre-line' }}>
            Spend with intention.{'\n'}Save without thinking.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: 16, lineHeight: 1.65, maxWidth: 340 }}>A budgeting companion built for students. Log it once, learn from it forever.</p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          {STATS.map(({ value, label }) => (
            <div key={label} style={{ flex: 1, background: 'rgba(255,255,255,0.10)', borderRadius: 14, padding: '16px 18px', backdropFilter: 'blur(4px)' }}>
              <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 26, color: '#fff', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 5 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={{ width: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf8f6', padding: '40px 60px' }}>
        <div style={{ width: '100%', maxWidth: 400 }} className="anim-up">
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--burgundy)', marginBottom: 8 }}>
              Welcome back
            </div>
            <h2 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 36, color: 'var(--text-primary)', fontWeight: 400, marginBottom: 6 }}>
              Sign in
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-muted)' }}>
              Enter your details to access your dashboard.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 7 }}>Email</label>
              <div style={{ position: 'relative' }}>
                <EmailOutlinedIcon style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 18 }} />
                <input className="input-field" type="email" placeholder="you@school.edu" value={form.email} onChange={e => set('email', e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} style={{ paddingLeft: 38 }} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 7 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <LockOutlinedIcon style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 18 }} />
                <input className="input-field" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} style={{ paddingLeft: 38, paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 0 }}>
                  {showPw ? <VisibilityOffOutlinedIcon style={{ fontSize: 18 }} /> : <VisibilityOutlinedIcon style={{ fontSize: 18 }} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ padding: '11px 15px', borderRadius: 9, background: 'var(--red-bg)', color: 'var(--red)', fontSize: 14, fontWeight: 500, border: '1px solid rgba(184,50,40,0.15)' }}>{error}</div>
            )}

            <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '14px', borderRadius: 12, fontSize: 16, marginTop: 4 }}>
              {loading
                ? <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                : <>Sign in <ArrowForwardIcon style={{ fontSize: 18 }} /></>}
            </button>

            <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' }}>
              New here?{' '}<Link to="/signup" style={{ color: 'var(--burgundy)', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
