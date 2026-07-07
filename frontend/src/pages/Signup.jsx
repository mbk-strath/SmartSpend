import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import WalletOutlinedIcon from '@mui/icons-material/WalletOutlined'
import { authAPI } from '../services/api'

const STATS = [
  { value: '12k+', label: 'Students' },
  { value: 'KES 4M', label: 'Tracked' },
  { value: '98%', label: 'Stay on budget' },
]

export default function Signup() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const set = (key, value) => setForm(current => ({ ...current, [key]: value }))

  const handleSubmit = async () => {
    setError('')
    if (!form.username.trim() || !form.email.trim() || !form.password || !form.confirmPassword) {
      setError('All fields are required.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await authAPI.register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      })
      navigate('/login', { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not create your account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div style={{ width: '50%', minHeight: '100vh', background: 'linear-gradient(160deg, var(--burgundy-deep) 0%, var(--burgundy) 55%, #a0222f 100%)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '36px 52px' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <WalletOutlinedIcon style={{ fontSize: 17, color: '#fff' }} />
          </div>
          <span style={{ fontFamily: 'Rubik, sans-serif', fontSize: 20, color: '#fff' }}>SmartSpend</span>
        </div>
        <div>
          <h1 style={{ fontFamily: 'Rubik, sans-serif', fontSize: 42, color: '#fff', lineHeight: 1.12, marginBottom: 18, fontWeight: 400, whiteSpace: 'pre-line' }}>
            Start your money{'\n'}journey today.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: 16, lineHeight: 1.65, maxWidth: 340 }}>Create an account and start building smarter spending habits.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {STATS.map(({ value, label }) => (
            <div key={label} style={{ flex: 1, background: 'rgba(255,255,255,0.10)', borderRadius: 14, padding: '16px 18px', backdropFilter: 'blur(4px)' }}>
              <div style={{ fontFamily: 'Rubik, sans-serif', fontSize: 26, color: '#fff', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 5 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ width: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf8f6', padding: '40px 60px' }}>
        <div style={{ width: '100%', maxWidth: 400 }} className="anim-up">
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--burgundy)', marginBottom: 8 }}>Get started</div>
            <h2 style={{ fontFamily: 'Rubik, sans-serif', fontSize: 36, color: 'var(--text-primary)', fontWeight: 400, marginBottom: 6 }}>Create account</h2>
            <p style={{ fontSize: 15, color: 'var(--text-muted)' }}>Fill in your details to set up your free account.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 7 }}>Username</label>
              <div style={{ position: 'relative' }}>
                <PersonOutlinedIcon style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 18 }} />
                <input className="input-field" required placeholder="Student name" value={form.username} onChange={e => set('username', e.target.value)} style={{ paddingLeft: 38 }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 7 }}>Email</label>
              <div style={{ position: 'relative' }}>
                <EmailOutlinedIcon style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 18 }} />
                <input className="input-field" required type="email" placeholder="you@school.edu" value={form.email} onChange={e => set('email', e.target.value)} style={{ paddingLeft: 38 }} />
              </div>
            </div>
            {[
              { key: 'password', label: 'Password' },
              { key: 'confirmPassword', label: 'Confirm password' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 7 }}>{label}</label>
                <div style={{ position: 'relative' }}>
                  <LockOutlinedIcon style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 18 }} />
                  <input className="input-field" required type={showPw ? 'text' : 'password'} placeholder="••••••••" value={form[key]} onChange={e => set(key, e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} style={{ paddingLeft: 38, paddingRight: 44 }} />
                  <button type="button" onClick={() => setShowPw(value => !value)} aria-label={showPw ? 'Hide passwords' : 'Show passwords'} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 0 }}>
                    {showPw ? <VisibilityOffOutlinedIcon style={{ fontSize: 18 }} /> : <VisibilityOutlinedIcon style={{ fontSize: 18 }} />}
                  </button>
                </div>
              </div>
            ))}

            {error && <div style={{ padding: '11px 15px', borderRadius: 9, background: 'var(--red-bg)', color: 'var(--red)', fontSize: 14, fontWeight: 500, border: '1px solid rgba(184,50,40,0.15)' }}>{error}</div>}

            <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '14px', borderRadius: 12, fontSize: 16, marginTop: 4 }}>
              {loading
                ? <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                : <>Create account <ArrowForwardIcon style={{ fontSize: 18 }} /></>}
            </button>
            <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' }}>
              Already have an account?{' '}<Link to="/login" style={{ color: 'var(--burgundy)', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
