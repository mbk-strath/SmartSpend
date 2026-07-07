import { Link, useLocation, useNavigate } from 'react-router-dom'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined'
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined'
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined'
import WalletOutlinedIcon from '@mui/icons-material/WalletOutlined'

export default function Header({ user }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isActive = p => pathname.startsWith(p)

  return (
    <header style={{ background: '#fff', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ padding: '0 40px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: '#7c1d2e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <WalletOutlinedIcon style={{ fontSize: 16, color: '#fff' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'Rubik, sans-serif', fontSize: 17, color: 'var(--text-primary)', lineHeight: 1.1 }}>SmartSpend</div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', lineHeight: 1 }}>For Students</div>
          </div>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {[
            { to: '/dashboard', label: 'Dashboard', Icon: DashboardOutlinedIcon },
            { to: '/analytics', label: 'Analytics',  Icon: BarChartOutlinedIcon },
          ].map(({ to, label, Icon }) => (
            <Link key={to} to={to} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600, background: isActive(to) ? '#7c1d2e' : 'transparent', color: isActive(to) ? '#fff' : 'var(--text-secondary)', transition: 'all 0.15s' }}>
              <Icon style={{ fontSize: 15 }} />{label}
            </Link>
          ))}

          <div style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 8px' }} />

          {user ? (
            <>
              <button onClick={() => { localStorage.removeItem('token'); navigate('/login') }} className="btn-ghost" style={{ fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}>
                <LoginOutlinedIcon style={{ fontSize: 15 }} /> Sign out
              </button>
              <button
                type="button"
                aria-label="Open profile"
                title="Profile"
                onClick={() => navigate('/profile')}
                style={{ width: 32, height: 32, borderRadius: '50%', border: pathname.startsWith('/profile') ? '2px solid var(--burgundy-light)' : 'none', background: '#7c1d2e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#fff', marginLeft: 4, flexShrink: 0, cursor: 'pointer', boxShadow: pathname.startsWith('/profile') ? '0 0 0 3px var(--burgundy-muted)' : 'none' }}
              >
                {user.username?.[0]?.toUpperCase()}
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    style={{ padding: '6px 14px', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}><LoginOutlinedIcon style={{ fontSize: 15 }} />Sign in</Link>
              <Link to="/signup" style={{ padding: '6px 14px', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600, background: '#7c1d2e', color: '#fff', display: 'flex', alignItems: 'center', gap: 5 }}><PersonAddOutlinedIcon style={{ fontSize: 15 }} />Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
