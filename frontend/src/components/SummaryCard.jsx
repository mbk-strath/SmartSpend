export default function SummaryCard({ label, value, icon: Icon, color, subtitle, loading }) {
  const colorMap = {
    green: { accent: 'var(--accent-green)', bg: 'rgba(52, 211, 153, 0.08)', border: 'rgba(52, 211, 153, 0.15)' },
    red: { accent: 'var(--accent-red)', bg: 'rgba(251, 113, 133, 0.08)', border: 'rgba(251, 113, 133, 0.15)' },
    gold: { accent: 'var(--accent-gold)', bg: 'rgba(251, 191, 36, 0.08)', border: 'rgba(251, 191, 36, 0.15)' },
    blue: { accent: 'var(--accent-blue)', bg: 'rgba(96, 165, 250, 0.08)', border: 'rgba(96, 165, 250, 0.15)' },
  }
  const c = colorMap[color] || colorMap.green

  return (
    <div
      className="animate-fade-in-up"
      style={{
        background: 'var(--bg-elevated)',
        border: `1px solid ${c.border}`,
        borderRadius: 16,
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = `0 8px 32px ${c.bg}`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: c.bg,
          filter: 'blur(24px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {label}
        </span>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: c.bg,
            border: `1px solid ${c.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {Icon && <Icon size={16} color={c.accent} strokeWidth={2} />}
        </div>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: 32, width: '70%' }} />
      ) : (
        <div
          style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 700,
            fontSize: 26,
            color: c.accent,
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          {value}
        </div>
      )}

      {subtitle && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{subtitle}</div>
      )}
    </div>
  )
}
