import { useState, useEffect } from 'react'
import { analyticsAPI } from '../services/api'
import { TrendChart, CategoryBarChart, SpendingPieChart } from '../components/Charts'
import { BarChart2, PieChart, TrendingUp, Calendar } from 'lucide-react'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function Analytics() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [trend, setTrend] = useState([])
  const [byCategory, setByCategory] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeChart, setActiveChart] = useState('bar') // 'bar' | 'pie'

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [trendRes, catRes, sumRes] = await Promise.all([
          analyticsAPI.monthlyTrend({ year }),
          analyticsAPI.byCategory({ year, month }),
          analyticsAPI.summary({ year, month }),
        ])
        setTrend(trendRes.data)
        setByCategory(catRes.data)
        setSummary(sumRes.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [year, month])

  const fmt = (n) => `KES ${(n || 0).toLocaleString('en-KE')}`
  const savingsRate = summary?.total_income
    ? Math.round(((summary.total_income - summary.total_expense) / summary.total_income) * 100)
    : 0

  const chartSection = (title, icon, children) => (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        {icon}
        <h2 style={{ margin: 0, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 17, color: 'var(--text-primary)' }}>
          {title}
        </h2>
      </div>
      {loading ? (
        <div className="skeleton" style={{ height: 220, borderRadius: 10 }} />
      ) : children}
    </div>
  )

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 30, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
            Analytics
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 13 }}>
            Insights into your spending patterns
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Calendar size={14} color="var(--text-muted)" />
          <select
            className="input-field"
            value={month}
            onChange={(e) => setMonth(+e.target.value)}
            style={{ width: 110 }}
          >
            {MONTHS.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            className="input-field"
            value={year}
            onChange={(e) => setYear(+e.target.value)}
            style={{ width: 90 }}
          >
            {[2023, 2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Income', value: fmt(summary?.total_income), color: '#34d399' },
          { label: 'Expenses', value: fmt(summary?.total_expense), color: '#fb7185' },
          { label: 'Net', value: fmt(summary?.net_balance), color: summary?.net_balance >= 0 ? '#34d399' : '#fb7185' },
          { label: 'Savings Rate', value: `${savingsRate}%`, color: savingsRate >= 20 ? '#34d399' : savingsRate >= 0 ? '#fbbf24' : '#fb7185' },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="animate-fade-in-up"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '18px 20px',
            }}
          >
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 500, marginBottom: 8 }}>
              {label}
            </div>
            {loading ? (
              <div className="skeleton" style={{ height: 24, width: '60%' }} />
            ) : (
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, color, letterSpacing: '-0.02em' }}>
                {value}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Trend */}
        {chartSection(
          `${year} Monthly Trend`,
          <TrendingUp size={16} color="var(--accent-green)" />,
          trend.length ? <TrendChart data={trend} /> : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No trend data for {year}
            </div>
          )
        )}

        {/* Category breakdown toggle */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {activeChart === 'bar'
                ? <BarChart2 size={16} color="var(--accent-blue)" />
                : <PieChart size={16} color="var(--accent-gold)" />}
              <h2 style={{ margin: 0, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 17, color: 'var(--text-primary)' }}>
                By Category
              </h2>
            </div>
            <div style={{ display: 'flex', background: 'var(--bg-card)', borderRadius: 8, padding: 3, gap: 3 }}>
              {[['bar', BarChart2], ['pie', PieChart]].map(([key, Icon]) => (
                <button
                  key={key}
                  onClick={() => setActiveChart(key)}
                  style={{
                    width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: activeChart === key ? 'var(--bg-elevated)' : 'transparent',
                    color: activeChart === key ? 'var(--text-primary)' : 'var(--text-muted)',
                    transition: 'all 0.15s',
                  }}
                >
                  <Icon size={14} />
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="skeleton" style={{ height: 220, borderRadius: 10 }} />
          ) : byCategory.length ? (
            activeChart === 'bar'
              ? <CategoryBarChart data={byCategory} />
              : <SpendingPieChart data={byCategory} />
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No category data for this period
            </div>
          )}
        </div>
      </div>

      {/* Category breakdown table */}
      <div className="card" style={{ padding: 24 }}>
        <h2 style={{ margin: '0 0 18px', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 17, color: 'var(--text-primary)' }}>
          Category Breakdown — {MONTHS[month - 1]} {year}
        </h2>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 40, borderRadius: 8 }} />)}
          </div>
        ) : byCategory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 13 }}>
            No transactions for this period.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 60px', gap: 12, padding: '6px 12px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              <span>Category</span><span style={{ textAlign: 'right' }}>Total</span><span style={{ textAlign: 'right' }}>Count</span><span style={{ textAlign: 'right' }}>Type</span>
            </div>
            {byCategory.map((row, i) => (
              <div
                key={i}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 80px 80px 60px', gap: 12,
                  padding: '10px 12px', borderRadius: 10,
                  background: 'var(--bg-card)', fontSize: 13,
                  alignItems: 'center',
                }}
              >
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{row.category}</span>
                <span style={{
                  textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontWeight: 500, fontSize: 12,
                  color: row.type === 'income' ? 'var(--accent-green)' : 'var(--accent-red)',
                }}>
                  {row.total.toLocaleString()}
                </span>
                <span style={{ textAlign: 'right', color: 'var(--text-muted)' }}>{row.count}</span>
                <span style={{ textAlign: 'right' }}>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
                    background: row.type === 'income' ? 'rgba(52, 211, 153, 0.12)' : 'rgba(251, 113, 133, 0.12)',
                    color: row.type === 'income' ? 'var(--accent-green)' : 'var(--accent-red)',
                    textTransform: 'capitalize',
                  }}>
                    {row.type}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
