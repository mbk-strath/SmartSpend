import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { analyticsAPI, transactionsAPI } from '../services/api'
import { CashflowChart, DonutChart, WeeklyBarChart } from '../components/Charts'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined'
import DonutSmallOutlinedIcon from '@mui/icons-material/DonutSmallOutlined'
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const sanitizePdfText = value => String(value ?? '').normalize('NFKD').replace(/[^\x20-\x7E]/g, ' ')
const escapePdfText = value => sanitizePdfText(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')

const truncatePdfText = (value, maxLength) => {
  const text = sanitizePdfText(value).trim()
  return text.length > maxLength ? `${text.slice(0, maxLength - 3)}...` : text
}

const addPdfText = (ops, text, x, y, size = 10, font = 'F1') => {
  ops.push(`BT /${font} ${size} Tf ${x} ${y} Td (${escapePdfText(text)}) Tj ET`)
}

const addPdfLine = (ops, x1, y1, x2, y2, color = '0.82 0.79 0.76', width = 0.75) => {
  ops.push(`q ${color} RG ${width} w ${x1} ${y1} m ${x2} ${y2} l S Q`)
}

const addPdfRect = (ops, x, y, width, height, color = '0.97 0.96 0.95') => {
  ops.push(`q ${color} rg ${x} ${y} ${width} ${height} re f Q`)
}

const createReportPdfBlob = ({ period, generatedAt, summary, savingsRate, topCategories, recentTransactions, fmt }) => {
  const pageWidth = 612
  const pageHeight = 792
  const margin = 54
  const bottom = 54
  const pages = [[]]
  let ops = pages[0]
  let y = 726

  const newPage = () => {
    ops = []
    pages.push(ops)
    y = 726
    addPdfText(ops, 'SmartSpend Transaction Report', margin, y, 15, 'F2')
    addPdfText(ops, period, margin, y - 18, 10)
    addPdfLine(ops, margin, y - 31, pageWidth - margin, y - 31)
    y -= 58
  }

  const ensureSpace = height => {
    if (y - height < bottom) newPage()
  }

  addPdfText(ops, 'SmartSpend Transaction Report', margin, y, 22, 'F2')
  addPdfText(ops, period, margin, y - 24, 13)
  addPdfText(ops, `Generated ${generatedAt}`, margin, y - 42, 9)
  addPdfLine(ops, margin, y - 60, pageWidth - margin, y - 60)
  y -= 92

  const cardGap = 10
  const cardWidth = (pageWidth - margin * 2 - cardGap * 3) / 4
  const cards = [
    ['Income', fmt(summary?.total_income)],
    ['Expenses', fmt(summary?.total_expense)],
    ['Net balance', fmt(summary?.net_balance)],
    ['Savings rate', `${savingsRate}%`],
  ]

  cards.forEach(([label, value], index) => {
    const x = margin + index * (cardWidth + cardGap)
    addPdfRect(ops, x, y - 64, cardWidth, 64)
    addPdfText(ops, label.toUpperCase(), x + 12, y - 21, 8, 'F2')
    addPdfText(ops, truncatePdfText(value, 18), x + 12, y - 45, 13, 'F2')
  })
  y -= 98

  addPdfText(ops, 'Top Expense Categories', margin, y, 14, 'F2')
  addPdfLine(ops, margin, y - 10, pageWidth - margin, y - 10)
  y -= 30

  if (topCategories.length) {
    topCategories.forEach((category, index) => {
      ensureSpace(24)
      addPdfText(ops, `${index + 1}. ${truncatePdfText(category.category, 42)}`, margin, y, 10, 'F2')
      addPdfText(ops, fmt(category.total), pageWidth - margin - 110, y, 10)
      y -= 20
    })
  } else {
    addPdfText(ops, 'No expense categories yet.', margin, y, 10)
    y -= 20
  }

  y -= 20
  ensureSpace(72)
  addPdfText(ops, 'Recent Transactions', margin, y, 14, 'F2')
  addPdfLine(ops, margin, y - 10, pageWidth - margin, y - 10)
  y -= 32

  const drawTableHeader = () => {
    addPdfRect(ops, margin, y - 18, pageWidth - margin * 2, 24, '0.94 0.92 0.91')
    addPdfText(ops, 'DATE', margin + 10, y - 8, 8, 'F2')
    addPdfText(ops, 'TITLE', margin + 88, y - 8, 8, 'F2')
    addPdfText(ops, 'CATEGORY', margin + 246, y - 8, 8, 'F2')
    addPdfText(ops, 'TYPE', margin + 360, y - 8, 8, 'F2')
    addPdfText(ops, 'AMOUNT', margin + 430, y - 8, 8, 'F2')
    y -= 30
  }

  drawTableHeader()

  if (recentTransactions.length) {
    recentTransactions.forEach(tx => {
      ensureSpace(32)
      if (y === 668) drawTableHeader()

      const date = new Date(tx.date).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })
      const sign = tx.type === 'income' ? '+' : '-'
      addPdfText(ops, date, margin + 10, y, 9)
      addPdfText(ops, truncatePdfText(tx.title, 24), margin + 88, y, 9)
      addPdfText(ops, truncatePdfText(tx.category, 18), margin + 246, y, 9)
      addPdfText(ops, tx.type, margin + 360, y, 9)
      addPdfText(ops, `${sign}${fmt(tx.amount)}`, margin + 430, y, 9, 'F2')
      addPdfLine(ops, margin, y - 12, pageWidth - margin, y - 12, '0.90 0.88 0.86', 0.5)
      y -= 24
    })
  } else {
    addPdfText(ops, 'No transactions recorded.', margin + 10, y, 10)
  }

  const fontObjectStart = pages.length * 2 + 3
  const pageObjects = pages.map((pageOps, index) => {
    const pageObjectId = 3 + index * 2
    const contentObjectId = pageObjectId + 1
    const content = `${pageOps.join('\n')}\n`
    return {
      pageObject: `${pageObjectId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontObjectStart} 0 R /F2 ${fontObjectStart + 1} 0 R >> >> /Contents ${contentObjectId} 0 R >>\nendobj\n`,
      contentObject: `${contentObjectId} 0 obj\n<< /Length ${content.length} >>\nstream\n${content}endstream\nendobj\n`,
      pageObjectId,
    }
  })

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    `2 0 obj\n<< /Type /Pages /Kids [${pageObjects.map(page => `${page.pageObjectId} 0 R`).join(' ')}] /Count ${pageObjects.length} >>\nendobj\n`,
    ...pageObjects.flatMap(page => [page.pageObject, page.contentObject]),
    `${fontObjectStart} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`,
    `${fontObjectStart + 1} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`,
  ]

  let pdf = '%PDF-1.4\n'
  const offsets = [0]

  objects.forEach(object => {
    offsets.push(pdf.length)
    pdf += object
  })

  const xrefOffset = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  offsets.slice(1).forEach(offset => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
  })
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

  return new Blob([pdf], { type: 'application/pdf' })
}

export default function Analytics() {
  const location = useLocation()
  const now = new Date()
  const [year,    setYear]   = useState(now.getFullYear())
  const [month,   setMonth]  = useState(now.getMonth() + 1)
  const [trend,   setTrend]  = useState([])
  const [cats,    setCats]   = useState([])
  const [sum,     setSum]    = useState(null)
  const [weekly,  setWeekly] = useState([])
  const [categoryType, setCategoryType] = useState('expense')
  const [loading, setLoading] = useState(true)
  const [reportLoading, setReportLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [t, c, s, w] = await Promise.all([
          analyticsAPI.monthlyTrend({ year }),
          analyticsAPI.byCategory({ year, month }),
          analyticsAPI.summary({ year, month }),
          analyticsAPI.weeklySpending({ year, month }),
        ])
        setTrend(t.data); setCats(c.data); setSum(s.data); setWeekly(w.data)
      } catch(e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [year, month])

  useEffect(() => {
    if (location.hash !== '#category-breakdown' || loading) return
    const target = document.getElementById('category-breakdown')
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [location.hash, loading])

  const fmt      = n => `KES ${(n || 0).toLocaleString('en-KE')}`
  const savPct   = sum?.total_income ? Math.round(((sum.total_income - sum.total_expense) / sum.total_income) * 100) : 0
  const avgDay   = sum?.total_expense ? Math.round(sum.total_expense / 30) : 0
  const topExp   = cats.filter(d => d.type === 'expense').sort((a, b) => b.total - a.total)

  const downloadReport = async () => {
    setReportLoading(true)
    try {
      const res = await transactionsAPI.list({ limit: 100 })
      const recent = (res.data || [])
        .filter(tx => {
          const d = new Date(tx.date)
          return d.getFullYear() === year && d.getMonth() + 1 === month
        })
        .slice(0, 36)

      const blob = createReportPdfBlob({
        period: `${MONTHS[month - 1]} ${year}`,
        generatedAt: new Date().toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' }),
        summary: sum,
        savingsRate: savPct,
        topCategories: topExp.slice(0, 5),
        recentTransactions: recent,
        fmt,
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `smartspend-report-${year}-${String(month).padStart(2, '0')}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error(e)
    } finally {
      setReportLoading(false)
    }
  }

  const KpiCard = ({ label, value, sub, Icon }) => (
    <div className="card" style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
        {Icon && <Icon style={{ fontSize: 15, color: 'var(--text-muted)' }} />}
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</div>
      </div>
      {loading
        ? <div className="skeleton" style={{ height: 26, width: '55%', marginBottom: 6 }} />
        : <div style={{ fontFamily: 'Rubik, sans-serif', fontSize: 24, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1 }}>{value}</div>}
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
            <h1 style={{ fontFamily: 'Rubik, sans-serif', fontSize: 36, fontWeight: 400, color: 'var(--text-primary)', marginBottom: 4 }}>Where your money really goes</h1>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 3 }}>
              <h2 style={{ fontSize: 22 }}>By category</h2>
              <select className="input-field" value={categoryType} onChange={e => setCategoryType(e.target.value)} style={{ width: 124, paddingTop: 8, paddingBottom: 8, fontSize: 13 }}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 18 }}>{categoryType === 'expense' ? 'Expenses' : 'Income'} this month</p>
            {loading
              ? <div className="skeleton" style={{ height: 210, borderRadius: 8 }} />
              : <DonutChart data={cats} type={categoryType} />}
          </div>
        </div>

        {/* Weekly bar */}
        <div className="card" style={{ padding: '24px 28px', marginBottom: 18 }}>
          <h2 style={{ fontSize: 22, marginBottom: 3 }}>Weekly spending</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 18 }}>Actual spending · {MONTHS[month - 1]} {year}</p>
          {loading
            ? <div className="skeleton" style={{ height: 180, borderRadius: 8 }} />
            : <WeeklyBarChart data={weekly} />}
        </div>

        {/* Category table */}
        <div id="category-breakdown" className="card" style={{ padding: '24px 28px', scrollMarginTop: 96 }}>
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
                  <span style={{ textAlign: 'right', fontFamily: 'Rubik, sans-serif', fontSize: 13, fontWeight: 700, color: row.type === 'income' ? 'var(--green)' : 'var(--red)' }}>
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

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 18 }}>
          <button onClick={downloadReport} disabled={loading || reportLoading} className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            <FileDownloadOutlinedIcon style={{ fontSize: 16 }} /> {reportLoading ? 'Preparing...' : 'Download Report'}
          </button>
        </div>
      </div>
    </div>
  )
}
