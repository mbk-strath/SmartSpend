import { useState, useEffect } from 'react'
import { analyticsAPI } from '../services/api'
import { CashflowChart, DonutChart, WeeklyBarChart } from '../components/Charts'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined'
import DonutSmallOutlinedIcon from '@mui/icons-material/DonutSmallOutlined'
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function Analytics() {
  const now = new Date()
  const [year,    setYear]   = useState(now.getFullYear())
  const [month,   setMonth]  = useState(now.getMonth() + 1)
  const [trend,   setTrend]  = useState([])
  const [cats,    setCats]   = useState([])
  const [sum,     setSum]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [t, c, s] = await Promise.all([
          analyticsAPI.monthlyTrend({ year }),
          analyticsAPI.byCategory({ year, month }),
          analyticsAPI.summary({ year, month }),
        ])
        setTrend(t.data); setCats(c.data); setSum(s.data)
      } catch(e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [year, month])

  const fmt      = n => `KES ${(n || 0).toLocaleString('en-KE')}`
  const savPct   = sum?.total_income ? Math.round(((sum.total_income - sum.total_expense) / sum.total_income) * 100) : 0
  const avgDay   = sum?.total_expense ? Math.round(sum.total_expense / 30) : 0
  const topExp   = cats.filter(d => d.type === 'expense').sort((a, b) => b.total - a.total)

  const weeklyData = [
    { week: 'W1', expense: sum?.total_expense ? Math.round(sum.total_expense * 0.22) : 0 },
    { week: 'W2', expense: sum?.total_expense ? Math.round(sum.total_expense * 0.28) : 0 },
    { week: 'W3', expense: sum?.total_expense ? Math.round(sum.total_expense * 0.20) : 0 },
    { week: 'W4', expense: sum?.total_expense ? Math.round(sum.total_expense * 0.30) : 0 },
  ]

  const KpiCard = ({ label, value, sub, Icon }) => (
    <div className="card" style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
        {Icon && <Icon style={{ fontSize: 15, color: 'var(--text-muted)' }} />}
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</div>
      </div>
      {loading
        ? <div className="skeleton" style={{ height: 26, width: '55%', marginBottom: 6 }} />
        : <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 24, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1 }}>{value}</div>}
      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>{sub}</div>
    </div>
  )

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* Header band */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: '24px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--burgundy)', marginBottom: 6 }}>INSIGHTS</div>
            <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 36, fontWeight: 400, color: 'var(--text-primary)', marginBottom: 4 }}>Where your money really goes</h1>
            <p style={{ fontSize: 15, color: 'var(--text-muted)' }}>Patterns, categories, and trends from every transaction you log.</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <CalendarTodayOutlinedIcon style={{ fontSize: 15, color: 'var(--text-muted)' }} />
            <select className="input-field" value={month} onChange={e => setMonth(+e.target.value)} style={{ width: 108 }}>
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <select className="input-field" value={year} onChange={e => setYear(+e.target.value)} style={{ width: 90 }}>
              {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div style={{ padding: '28px 40px 48px' }}>

        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
          <KpiCard Icon={TrendingUpOutlinedIcon}  label="Top growing category"  value={topExp[0]?.category || 'None'} sub={topExp[0] ? `KES ${topExp[0].total.toLocaleString()} this month` : 'No data'} />
          <KpiCard Icon={DonutSmallOutlinedIcon}  label="Largest share"         value={topExp[0]?.category || 'None'} sub={topExp[0] && sum?.total_expense ? `${Math.round((topExp[0].total / sum.total_expense) * 100)}% of expenses` : 'No data'} />
          <KpiCard Icon={SavingsOutlinedIcon}     label="Savings rate"          value={`${savPct}%`} sub={`Goal: ${savPct >= 20 ? 'Met' : '20%'}`} />
          <KpiCard Icon={AccessTimeOutlinedIcon}  label="Avg. daily spend"      value={fmt(avgDay)} sub="This month" />
        </div>

        {/* Charts row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18, marginBottom: 18 }}>
          <div className="card" style={{ padding: '24px 28px' }}>
            <h2 style={{ fontSize: 22, marginBottom: 3 }}>Cashflow this year</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 18 }}>Income vs spending · {year}</p>
            {loading
              ? <div className="skeleton" style={{ height: 210, borderRadius: 8 }} />
              : trend.length
                ? <CashflowChart data={trend} />
                : <div style={{ height: 210, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 14 }}>No data for {year}</div>}
          </div>
          <div className="card" style={{ padding: '24px 28px' }}>
            <h2 style={{ fontSize: 22, marginBottom: 3 }}>By category</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 18 }}>This month</p>
            {loading
              ? <div className="skeleton" style={{ height: 210, borderRadius: 8 }} />
              : <DonutChart data={cats} />}
          </div>
        </div>

        {/* Weekly bar */}
        <div className="card" style={{ padding: '24px 28px', marginBottom: 18 }}>
          <h2 style={{ fontSize: 22, marginBottom: 3 }}>Weekly spending</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 18 }}>Estimated distribution · {MONTHS[month - 1]} {year}</p>
          {loading
            ? <div className="skeleton" style={{ height: 180, borderRadius: 8 }} />
            : <WeeklyBarChart data={weeklyData} />}
        </div>

        {/* Category table */}
        <div className="card" style={{ padding: '24px 28px' }}>
          <h2 style={{ fontSize: 22, marginBottom: 16 }}>Category breakdown — {MONTHS[month - 1]} {year}</h2>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 44, borderRadius: 8 }} />)}
            </div>
          ) : cats.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 14 }}>No transactions this period.</div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 80px 70px', gap: 12, padding: '0 10px 10px', fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                <span>Category</span><span style={{ textAlign: 'right' }}>Total</span><span style={{ textAlign: 'right' }}>Count</span><span style={{ textAlign: 'right' }}>Type</span>
              </div>
              {cats.map((row, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 80px 70px', gap: 12, padding: '11px 10px', borderRadius: 9, alignItems: 'center', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-input)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{row.category}</span>
                  <span style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: row.type === 'income' ? 'var(--green)' : 'var(--red)' }}>
                    {row.total.toLocaleString()}
                  </span>
                  <span style={{ textAlign: 'right', fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{row.count}</span>
                  <span style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: row.type === 'income' ? 'var(--green-bg)' : 'var(--red-bg)', color: row.type === 'income' ? 'var(--green)' : 'var(--red)' }}>
                      {row.type}
                    </span>
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
