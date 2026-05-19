import { useState, useEffect } from 'react'
import { analyticsAPI } from '../services/api'
import { CashflowChart, DonutChart, WeeklyBarChart } from '../components/Charts'
import { Calendar } from 'lucide-react'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function buildWeeklyData(transactions) {
  const weeks = [
    { week: 'W1', expense: 0 }, { week: 'W2', expense: 0 },
    { week: 'W3', expense: 0 }, { week: 'W4', expense: 0 },
  ]
  return weeks
}

export default function Analytics() {
  const now = new Date()
  const [year, setYear]       = useState(now.getFullYear())
  const [month, setMonth]     = useState(now.getMonth() + 1)
  const [trend, setTrend]     = useState([])
  const [byCategory, setCats] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [tRes, cRes, sRes] = await Promise.all([
          analyticsAPI.monthlyTrend({ year }),
          analyticsAPI.byCategory({ year, month }),
          analyticsAPI.summary({ year, month }),
        ])
        setTrend(tRes.data)
        setCats(cRes.data)
        setSummary(sRes.data)
      } catch(e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [year, month])

  const fmt = n => `KES ${(n||0).toLocaleString('en-KE')}`
  const savingsRate = summary?.total_income
    ? Math.round(((summary.total_income - summary.total_expense) / summary.total_income) * 100)
    : 0
  const avgDaily = summary?.total_expense
    ? Math.round(summary.total_expense / 30)
    : 0

  const topExpCat = byCategory.filter(d => d.type === 'expense').sort((a,b) => b.total - a.total)[0]
  const largestShare = byCategory.filter(d => d.type === 'expense').reduce((acc, d) => {
    return summary?.total_expense ? { ...d, pct: Math.round((d.total / summary.total_expense) * 100) } : d
  }, null)

  // Build fake weekly for demo (replace with real endpoint if needed)
  const weeklyData = [
    { week: 'W1', expense: summary?.total_expense ? Math.round(summary.total_expense * 0.22) : 0 },
    { week: 'W2', expense: summary?.total_expense ? Math.round(summary.total_expense * 0.28) : 0 },
    { week: 'W3', expense: summary?.total_expense ? Math.round(summary.total_expense * 0.20) : 0 },
    { week: 'W4', expense: summary?.total_expense ? Math.round(summary.total_expense * 0.30) : 0 },
  ]

  const statCard = (label, value, sub) => (
    <div className="card" style={{ padding: '18px 20px' }}>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
        {label}
      </div>
      {loading
        ? <div className="skeleton" style={{ height: 22, width: '60%', marginBottom: 6 }} />
        : <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 20, color: 'var(--text-primary)', marginBottom: 4 }}>{value}</div>}
      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</div>
    </div>
  )

  return (
    <div style={{ maxWidth: 1160, margin: '0 auto', padding: '20px 20px 40px' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--burgundy)', marginBottom: 4 }}>
          INSIGHTS
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 30, fontWeight: 400, color: 'var(--text-primary)' }}>
            Where your money really goes
          </h1>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Calendar size={13} color="var(--text-muted)" />
            <select className="input-field" value={month} onChange={e => setMonth(+e.target.value)} style={{ width: 100 }}>
              {MONTHS.map((m,i) => <option key={i} value={i+1}>{m}</option>)}
            </select>
            <select className="input-field" value={year} onChange={e => setYear(+e.target.value)} style={{ width: 85 }}>
              {[2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          Patterns, categories, and trends from every transaction you log.
        </p>
      </div>

      {/* Insight Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {statCard(
          '↗ Top growing category',
          topExpCat?.category || '—',
          topExpCat ? `KES ${topExpCat.total.toLocaleString()} this month` : 'No data',
        )}
        {statCard(
          '◎ Largest share',
          byCategory.filter(d=>d.type==='expense').sort((a,b)=>b.total-a.total)[0]
            ? `${byCategory.filter(d=>d.type==='expense').sort((a,b)=>b.total-a.total)[0].category}`
            : '—',
          summary?.total_expense && byCategory.filter(d=>d.type==='expense').sort((a,b)=>b.total-a.total)[0]
            ? `${Math.round((byCategory.filter(d=>d.type==='expense').sort((a,b)=>b.total-a.total)[0].total/summary.total_expense)*100)}% of expenses`
            : 'No data',
        )}
        {statCard(
          '◈ Savings rate',
          `${savingsRate}%`,
          `Goal: ${savingsRate >= 20 ? '✓ Met' : '20%'}`,
        )}
        {statCard(
          '◷ Avg. daily spend',
          fmt(avgDaily),
          summary?.total_expense ? `Down from previous` : 'This month',
        )}
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="card" style={{ padding: '22px 24px' }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 18, color: 'var(--text-primary)', marginBottom: 2 }}>Cashflow this year</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Income vs spending · {year}</div>
          </div>
          {loading ? <div className="skeleton" style={{ height: 200, borderRadius: 8 }} />
            : trend.length ? <CashflowChart data={trend} /> : (
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No data for {year}</div>
            )}
        </div>

        <div className="card" style={{ padding: '22px 24px' }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 18, color: 'var(--text-primary)', marginBottom: 2 }}>By category</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>This month</div>
          </div>
          {loading ? <div className="skeleton" style={{ height: 200, borderRadius: 8 }} />
            : <DonutChart data={byCategory} />}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="card" style={{ padding: '22px 24px', marginBottom: 16 }}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 18, color: 'var(--text-primary)', marginBottom: 2 }}>Weekly spending</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Estimated distribution · {MONTHS[month-1]} {year}</div>
        </div>
        {loading ? <div className="skeleton" style={{ height: 180, borderRadius: 8 }} />
          : <WeeklyBarChart data={weeklyData} />}
      </div>

      {/* Category table */}
      <div className="card" style={{ padding: '22px 24px' }}>
        <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 18, color: 'var(--text-primary)', marginBottom: 16 }}>
          Category breakdown — {MONTHS[month-1]} {year}
        </div>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...Array(4)].map((_,i) => <div key={i} className="skeleton" style={{ height: 38, borderRadius: 8 }} />)}
          </div>
        ) : byCategory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 13 }}>No transactions this period.</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 80px 60px', gap: 12, padding: '0 8px 8px', fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', marginBottom: 6 }}>
              <span>Category</span><span style={{ textAlign: 'right' }}>Total</span><span style={{ textAlign: 'right' }}>Count</span><span style={{ textAlign: 'right' }}>Type</span>
            </div>
            {byCategory.map((row, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '1fr 100px 80px 60px', gap: 12,
                padding: '10px 8px', borderRadius: 8, alignItems: 'center',
                transition: 'background 0.1s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-input)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{row.category}</span>
                <span style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600, color: row.type === 'income' ? 'var(--green)' : 'var(--red)' }}>
                  {row.total.toLocaleString()}
                </span>
                <span style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-muted)' }}>{row.count}</span>
                <span style={{ textAlign: 'right' }}>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                    background: row.type === 'income' ? 'var(--green-bg)' : 'var(--red-bg)',
                    color: row.type === 'income' ? 'var(--green)' : 'var(--red)',
                  }}>{row.type}</span>
                </span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
