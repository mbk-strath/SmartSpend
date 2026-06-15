export default function SummaryCard({ label, value, Icon, color, subtitle, loading }) {
  const colorMap = {
    green: { accent: 'var(--green)', bg: 'var(--green-bg)' },
    red:   { accent: 'var(--red)',   bg: 'var(--red-bg)' },
    gold:  { accent: 'var(--gold)',  bg: 'rgba(154,111,0,0.09)' },
    blue:  { accent: '#2b5ea7',      bg: 'rgba(43,94,167,0.09)' },
    burg:  { accent: 'var(--burgundy)', bg: 'var(--burgundy-muted)' },
  }
  const c = colorMap[color] || colorMap.burg

  return (
    <div className="card" style={{ padding: '18px 20px', transition: 'box-shadow 0.15s', cursor: 'default' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</span>
        {Icon && (
          <div style={{ width: 30, height: 30, borderRadius: 8, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon style={{ fontSize: 15, color: c.accent }} />
          </div>
        )}
      </div>
      {loading
        ? <div className="skeleton" style={{ height: 26, width: '65%', marginBottom: 6 }} />
        : <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 22, color: c.accent, marginBottom: 4 }}>{value}</div>}
      {subtitle && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{subtitle}</div>}
    </div>
  )
}
