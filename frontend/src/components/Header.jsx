import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, BarChart2, LogOut, Wallet } from 'lucide-react'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/analytics', label: 'Analytics', icon: BarChart2 },
]

export default function Header({ user }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <header
      style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link
          to="/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Wallet size={18} color="#080a0f" strokeWidth={2.5} />
          </div>
          <span
            style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700,
              fontSize: 18,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            Smart<span style={{ color: 'var(--accent-green)' }}>Spend</span>
          </span>
        </Link>

        {/* Nav */}
        <nav style={{ display: 'flex', gap: 4 }}>
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname.startsWith(to)
            return (
              <Link
                key={to}
                to={to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '7px 14px',
                  borderRadius: 9,
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: 'DM Sans, sans-serif',
                  background: active ? 'var(--bg-card)' : 'transparent',
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  border: active ? '1px solid var(--border-hover)' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={15} strokeWidth={active ? 2.5 : 2} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* User + Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '5px 12px 5px 5px',
                borderRadius: 24,
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #34d399, #60a5fa)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: 'Syne, sans-serif',
                  color: '#080a0f',
                }}
              >
                {user.username?.[0]?.toUpperCase()}
              </div>
              <span
                style={{
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                {user.username}
              </span>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 12px',
              borderRadius: 9,
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: 13,
              fontFamily: 'DM Sans, sans-serif',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--accent-red)'
              e.currentTarget.style.borderColor = 'rgba(251, 113, 133, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)'
              e.currentTarget.style.borderColor = 'var(--border)'
            }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
