import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, BarChart2, LogIn, UserPlus } from 'lucide-react'

export default function Header({ user }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const isActive = (path) => pathname.startsWith(path)

  return (
    <header style={{
      background: '#fff',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{
        maxWidth: 1160, margin: '0 auto', padding: '0 20px',
        height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7, background: '#7c1d2e',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <rect x="2" y="5" width="20" height="14" rx="2"/>
              <path d="M2 10h20"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 16, color: 'var(--text-primary)', lineHeight: 1 }}>SmartSpend</div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1 }}>For Students</div>
          </div>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {[
            { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { to: '/analytics', label: 'Analytics', icon: BarChart2 },
          ].map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 8, textDecoration: 'none',
              fontSize: 13, fontWeight: 500,
              background: isActive(to) ? '#7c1d2e' : 'transparent',
              color: isActive(to) ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.15s',
            }}>
              <Icon size={13} />{label}
            </Link>
          ))}

          <div style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 6px' }} />

          {user ? (
            <>
              <button onClick={handleLogout} className="btn-ghost"
                style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
                <LogIn size={13} /> Sign out
              </button>
              <div style={{
                width: 30, height: 30, borderRadius: '50%', background: '#7c1d2e',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 600, fontSize: 12, color: '#fff', marginLeft: 4,
              }}>
                {user.username?.[0]?.toUpperCase()}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, textDecoration: 'none', fontSize: 13, color: 'var(--text-secondary)' }}>
                <LogIn size={13} /> Sign in
              </Link>
              <Link to="/register" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, textDecoration: 'none', fontSize: 13, color: 'var(--text-secondary)' }}>
                <UserPlus size={13} /> Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
