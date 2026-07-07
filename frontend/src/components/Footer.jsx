import { Link } from 'react-router-dom'

const linkStyle = {
  color: 'var(--text-secondary)',
  fontSize: 13,
  fontWeight: 600,
  textDecoration: 'none',
}

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="smart-footer" style={{ background: '#fff', borderTop: '1px solid var(--border)', padding: '26px 40px 30px' }}>
      <div className="footer-grid" style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr', gap: 28 }}>
        <div>
          <div style={{ fontFamily: 'Rubik, sans-serif', fontSize: 16, color: 'var(--text-primary)', marginBottom: 6 }}>SmartSpend</div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 360 }}>A simple student budget tracker for income, expenses, goals, and spending insights.</p>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>Links</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
            <Link to="/analytics" style={linkStyle}>Analytics</Link>
            <Link to="/profile" style={linkStyle}>Profile</Link>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>Contacts</div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 5 }}>Owners: Mikebrian Kamau and Peter Obwogi</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Copyright {year} SmartSpend. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
