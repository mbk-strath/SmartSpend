import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import AddIcon from '@mui/icons-material/Add'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import TrackChangesOutlinedIcon from '@mui/icons-material/TrackChangesOutlined'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined'
import DirectionsBusOutlinedIcon from '@mui/icons-material/DirectionsBusOutlined'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined'
import SportsEsportsOutlinedIcon from '@mui/icons-material/SportsEsportsOutlined'
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import WorkOutlineIcon from '@mui/icons-material/WorkOutline'
import LaptopOutlinedIcon from '@mui/icons-material/LaptopOutlined'
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined'
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { analyticsAPI, transactionsAPI } from '../services/api'
import { format } from 'date-fns'
import TransactionForm from '../components/TransactionForm'
import GoalSetter, { GoalBanner, loadGoals } from '../components/GoalSetter'
import { CashflowChart } from '../components/Charts'

const CATS_EXPENSE = ['Food and Dining', 'Transport', 'Rent', 'Books', 'Health', 'Fun', 'Utilities', 'Other']
const CATS_INCOME  = ['Salary', 'Freelance', 'Business', 'Investments', 'Gift', 'Allowance', 'Pocket money', 'Other']

const CAT_ICON = {
  'Food and Dining': RestaurantOutlinedIcon,
  'Food & Dining':   RestaurantOutlinedIcon,
  'Transport':       DirectionsBusOutlinedIcon,
  'Rent':            HomeOutlinedIcon,
  'Housing':         HomeOutlinedIcon,
  'Books':           MenuBookOutlinedIcon,
  'Education':       MenuBookOutlinedIcon,
  'Health':          LocalHospitalOutlinedIcon,
  'Healthcare':      LocalHospitalOutlinedIcon,
  'Fun':             SportsEsportsOutlinedIcon,
  'Entertainment':   SportsEsportsOutlinedIcon,
  'Utilities':       BoltOutlinedIcon,
  'Shopping':        ShoppingBagOutlinedIcon,
  'Salary':          WorkOutlineIcon,
  'Freelance':       LaptopOutlinedIcon,
  'Business':        TrendingUpOutlinedIcon,
  'Investments':     TrendingUpOutlinedIcon,
  'Gift':            CardGiftcardOutlinedIcon,
  'Other':           MoreHorizIcon,
}

const Spinner = () => (
  <span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block', flexShrink: 0 }} />
)

export default function Dashboard({ user }) {
  const navigate = useNavigate()
  const [summary, setSummary]     = useState(null)
  const [transactions, setTxs]    = useState([])
  const [trend, setTrend]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [showGoal, setShowGoal]   = useState(false)
  const [editTx, setEditTx]       = useState(null)
  const [qType, setQType]         = useState('expense')
  const [qAmount, setQAmount]     = useState('')
  const [qCat, setQCat]           = useState('')
  const [qNote, setQNote]         = useState('')
  const [qLoading, setQLoading]   = useState(false)
  const now = new Date()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [sumRes, txRes, trendRes] = await Promise.all([
        analyticsAPI.summary({ year: now.getFullYear(), month: now.getMonth() + 1 }),
        transactionsAPI.list({ limit: 8 }),
        analyticsAPI.monthlyTrend({ year: now.getFullYear() }),
      ])
      setSummary(sumRes.data)
      setTxs(txRes.data)
      setTrend(trendRes.data)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleQuickAdd = async () => {
    if (!qAmount || !qCat) return
    setQLoading(true)
    try {
      await transactionsAPI.create({ title: qNote || qCat, amount: parseFloat(qAmount), type: qType, category: qCat, description: qNote, date: new Date().toISOString() })
      setQAmount(''); setQCat(''); setQNote('')
      load()
    } catch(e) { console.error(e) }
    finally { setQLoading(false) }
  }

  const handleDelete = async id => {
    if (!confirm('Delete this transaction?')) return
    await transactionsAPI.delete(id); load()
  }

  const goals     = loadGoals()
  const limit     = goals.monthly_limit || 0
  const totalExp  = summary?.total_expense || 0
  const savingsPct = summary?.total_income ? Math.round(((summary.total_income - totalExp) / summary.total_income) * 100) : 0
  const formatKES = n => (n || 0).toLocaleString('en-KE')

  const heroMsg = () => {
    if (!summary || !summary.transaction_count) return { msg: 'Welcome to SmartSpend.', sub: 'Log your first transaction to start tracking your spending.' }
    if (limit > 0 && totalExp > limit) return { msg: 'You have hit your spending limit.', sub: `You are KES ${formatKES(totalExp - limit)} over budget this month.` }
    if (savingsPct >= 30) return { msg: "You are on track this month.", sub: `You have saved ${savingsPct}% of your income. Keep going.` }
    return { msg: 'You are doing well.', sub: `KES ${formatKES(summary?.net_balance)} net balance this month.` }
  }
  const { msg, sub } = heroMsg()

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(130deg, var(--burgundy-deep) 0%, var(--burgundy) 55%, #a84832 100%)', padding: '36px 40px 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, pointerEvents: 'none' }} />
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 10 }}>
          WELCOME BACK, {(user?.username || 'there').toUpperCase()}
        </div>
        <h1 style={{ fontFamily: 'Rubik, sans-serif', fontSize: 44, color: '#fff', lineHeight: 1.1, marginBottom: 12, fontWeight: 400, maxWidth: 580 }}>
          {msg.includes('on track') ? <>You are <span style={{ borderBottom: '2.5px solid rgba(255,255,255,0.7)' }}>on track</span> this month.</> : msg}
        </h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.68)', marginBottom: 24, maxWidth: 480, lineHeight: 1.65 }}>{sub}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setShowGoal(true)} style={{ padding: '10px 20px', borderRadius: 22, border: '1.5px solid rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.12)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: 7 }}>
            <TrackChangesOutlinedIcon style={{ fontSize: 17 }} /> Set a savings goal
          </button>
          <button onClick={() => setShowForm(true)} style={{ padding: '10px 20px', borderRadius: 22, border: '1.5px solid rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.12)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, backdropFilter: 'blur(4px)' }}>
            New transaction
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
          {[
            { label: 'BALANCE',      value: `KES ${formatKES(summary?.net_balance)}`,  sub: (summary?.net_balance || 0) >= 0 ? 'Positive this month' : 'Negative this month', ok: (summary?.net_balance || 0) >= 0 },
            { label: 'INCOME',       value: `KES ${formatKES(summary?.total_income)}`,  sub: `${summary?.transaction_count || 0} transactions`, ok: true },
            { label: 'EXPENSES',     value: `KES ${formatKES(summary?.total_expense)}`, sub: limit ? `${Math.min(Math.round((totalExp / limit) * 100), 100)}% of limit` : 'This month', ok: false },
            { label: 'SAVINGS GOAL', value: limit ? `${Math.max(0, savingsPct)}%` : 'Not set', sub: limit ? `KES ${formatKES(Math.max(0, limit - totalExp))} remaining` : 'Tap to set a goal', ok: savingsPct >= 20, click: () => setShowGoal(true) },
          ].map(({ label, value, sub: s, ok, click }, i) => (
            <div key={label} onClick={click} style={{ padding: '22px 32px', borderRight: i < 3 ? '1px solid var(--border)' : 'none', cursor: click ? 'pointer' : 'default', transition: 'background 0.15s' }}
              onMouseEnter={e => click && (e.currentTarget.style.background = 'var(--bg)')}
              onMouseLeave={e => click && (e.currentTarget.style.background = 'transparent')}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
              {loading
                ? <div className="skeleton" style={{ height: 30, width: '55%', marginBottom: 6 }} />
                : <div style={{ fontFamily: 'Rubik, sans-serif', fontSize: 28, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 5 }}>{value}</div>}
              <div style={{ fontSize: 12, fontWeight: 600, color: ok ? 'var(--green)' : 'var(--text-muted)' }}>{s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '28px 40px 48px' }}>
        {limit > 0 && <div style={{ marginBottom: 20 }}><GoalBanner totalExpense={totalExp} /></div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 20, marginBottom: 20 }}>

          {/* Quick Entry */}
          <div className="card" style={{ padding: '26px 28px' }}>
            <h2 style={{ fontSize: 22, marginBottom: 3 }}>Quick entry</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 18 }}>Log money in or out in seconds.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--bg-input)', borderRadius: 11, padding: 3, marginBottom: 16, gap: 3 }}>
              {['expense', 'income'].map(t => (
                <button key={t} onClick={() => { setQType(t); setQCat('') }} style={{ padding: '9px', borderRadius: 9, border: 'none', cursor: 'pointer', background: qType === t ? '#fff' : 'transparent', color: qType === t ? (t === 'expense' ? 'var(--red)' : 'var(--green)') : 'var(--text-muted)', fontSize: 14, fontWeight: 600, transition: 'all 0.15s', boxShadow: qType === t ? 'var(--shadow-sm)' : 'none', textTransform: 'capitalize' }}>
                  {t === 'expense' ? 'Expense' : 'Income'}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Amount (KES)</div>
              <input className="input-field" type="number" placeholder="0.00" value={qAmount} onChange={e => setQAmount(e.target.value)} style={{ fontFamily: 'Rubik, sans-serif', fontSize: 20, fontWeight: 700 }} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Category</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {(qType === 'expense' ? CATS_EXPENSE : CATS_INCOME).map(c => {
                  const Icon = CAT_ICON[c] || MoreHorizIcon
                  return (
                    <button key={c} onClick={() => setQCat(c)} style={{ padding: '5px 12px', borderRadius: 20, border: `1.5px solid ${qCat === c ? 'var(--burgundy)' : 'var(--border)'}`, background: qCat === c ? 'var(--burgundy-muted)' : 'transparent', color: qCat === c ? 'var(--burgundy)' : 'var(--text-secondary)', fontSize: 13, fontWeight: qCat === c ? 600 : 400, cursor: 'pointer', transition: 'all 0.1s', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Icon style={{ fontSize: 13 }} />{c}
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Note (optional)</div>
              <input className="input-field" placeholder="e.g. Lunch at campus" value={qNote} onChange={e => setQNote(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleQuickAdd()} />
            </div>

            <button className="btn-primary" onClick={handleQuickAdd} disabled={qLoading || !qAmount || !qCat} style={{ width: '100%', justifyContent: 'center', borderRadius: 11, padding: '13px' }}>
              {qLoading ? <Spinner /> : <><AddIcon style={{ fontSize: 18 }} /> Add transaction</>}
            </button>
          </div>

          {/* Recent Transactions */}
          <div className="card" style={{ padding: '26px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <h2 style={{ fontSize: 22, marginBottom: 3 }}>Recent transactions</h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Your latest activity</p>
              </div>
              <button onClick={() => navigate('/analytics#category-breakdown')} style={{ fontSize: 13, fontWeight: 600, color: 'var(--burgundy)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                View all <ChevronRightIcon style={{ fontSize: 16 }} />
              </button>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 52, borderRadius: 10 }} />)}
              </div>
            ) : transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 14 }}>No transactions yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {transactions.map(tx => {
                  const Icon = CAT_ICON[tx.category] || MoreHorizIcon
                  return (
                    <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '10px', borderRadius: 11, transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-input)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: tx.type === 'income' ? 'var(--green-bg)' : 'var(--red-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon style={{ fontSize: 18, color: tx.type === 'income' ? 'var(--green)' : 'var(--red)' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{tx.category} · {format(new Date(tx.date), 'dd MMM')}</div>
                      </div>
                      <div style={{ fontFamily: 'Rubik, sans-serif', fontSize: 14, fontWeight: 700, color: tx.type === 'income' ? 'var(--green)' : 'var(--red)', flexShrink: 0 }}>
                        {tx.type === 'income' ? '+' : ''}KES {tx.amount.toLocaleString()}
                      </div>
                      <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                        <button className="btn-ghost" style={{ width: 28, height: 28, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 7 }} onClick={() => { setEditTx(tx); setShowForm(true) }}>
                          <EditOutlinedIcon style={{ fontSize: 14 }} />
                        </button>
                        <button className="btn-ghost" style={{ width: 28, height: 28, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 7 }} onClick={() => handleDelete(tx.id)}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'} onMouseLeave={e => e.currentTarget.style.color = ''}>
                          <DeleteOutlineIcon style={{ fontSize: 14 }} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Chart */}
        <div className="card" style={{ padding: '26px 28px' }}>
          <h2 style={{ fontSize: 22, marginBottom: 3 }}>Overview</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 18 }}>Income vs spending · {now.getFullYear()}</p>
          {loading
            ? <div className="skeleton" style={{ height: 210, borderRadius: 10 }} />
            : trend.length
              ? <CashflowChart data={trend} />
              : <div style={{ height: 210, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 14 }}>Add transactions to see your trend</div>}
        </div>
      </div>

      {showForm  && <TransactionForm editData={editTx} onClose={() => { setShowForm(false); setEditTx(null) }} onSuccess={() => { setShowForm(false); setEditTx(null); load() }} />}
      {showGoal  && <GoalSetter onClose={() => setShowGoal(false)} currentExpense={totalExp} />}
    </div>
  )
}
